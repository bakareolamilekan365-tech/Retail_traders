"""Admin-only monitoring endpoints for users, predictions, and system stats."""

from __future__ import annotations

import subprocess
import sqlite3
import sys
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Path as FastAPIPath, Query, Request, status
from pydantic import BaseModel, EmailStr, Field

from api.limiter import limiter
from api.assets import ASSET_METADATA
from api.security import get_current_user

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class UserOut(BaseModel):
    """User summary for admin listing."""

    id: int
    username: str
    email: EmailStr
    is_admin: bool
    created_at: str


class PredictionLogOut(BaseModel):
    """Prediction log row for admin listing."""

    id: int
    user_id: int | None
    asset: str
    signal: str
    expected_return: float
    confidence: float
    timestamp: str


class AdminStatsOut(BaseModel):
    """Aggregate stats for admin dashboard."""

    total_users: int
    total_predictions: int
    top_asset: str | None
    most_active_user: str | None


class AdminAssetOut(BaseModel):
    """Placeholder asset status for admin asset management."""

    symbol: str
    name: str
    status: str
    enabled: bool


class AdminActionOut(BaseModel):
    """Generic response for admin actions."""

    detail: str


class AdminLogsOut(BaseModel):
    """Backend log snippet for admin review."""

    lines: List[str]
    content: str


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _default_model_path() -> Path:
    return _backend_root() / "model.joblib"


def _default_data_dir() -> Path:
    return _backend_root() / "data"


def _default_log_path() -> Path:
    return _backend_root() / "logs" / "app.log"


def _get_db_path(request: Request) -> Path:
    db_path = getattr(request.app.state, "database_path", None)
    if db_path is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )
    return Path(db_path)


def _get_admin_user(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    username = current_user.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    db_path = _get_db_path(request)
    try:
        with sqlite3.connect(str(db_path)) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT id, username, email, is_admin, created_at FROM users WHERE username = ?",
                (username,),
            ).fetchone()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load user record",
        ) from exc

    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not row["is_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    return dict(row)


@router.get("/users", response_model=List[UserOut])
@limiter.limit("5/second")
def list_users(request: Request, _: Dict[str, Any] = Depends(_get_admin_user)) -> List[UserOut]:
    """Return all registered users (admin-only)."""

    db_path = _get_db_path(request)
    try:
        with sqlite3.connect(str(db_path)) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                "SELECT id, username, email, is_admin, created_at FROM users ORDER BY id ASC"
            ).fetchall()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load users",
        ) from exc

    return [UserOut(**dict(row)) for row in rows]


@router.get("/predictions", response_model=List[PredictionLogOut])
@limiter.limit("5/second")
def list_predictions(
    request: Request,
    user_id: int | None = Query(default=None, ge=1),
    asset: str | None = Query(default=None, min_length=1),
    _: Dict[str, Any] = Depends(_get_admin_user),
) -> List[PredictionLogOut]:
    """Return prediction logs with optional filtering (admin-only)."""

    db_path = _get_db_path(request)
    asset_filter = asset.upper() if asset else None
    query = (
        "SELECT id, user_id, asset, signal, expected_return, confidence, timestamp "
        "FROM prediction_log"
    )
    filters: List[str] = []
    params: List[Any] = []

    if user_id is not None:
        filters.append("user_id = ?")
        params.append(user_id)
    if asset_filter is not None:
        filters.append("asset = ?")
        params.append(asset_filter)

    if filters:
        query += " WHERE " + " AND ".join(filters)
    query += " ORDER BY timestamp DESC"

    try:
        with sqlite3.connect(str(db_path)) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(query, params).fetchall()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load predictions",
        ) from exc

    return [PredictionLogOut(**dict(row)) for row in rows]


@router.get("/stats", response_model=AdminStatsOut)
@limiter.limit("5/second")
def get_stats(request: Request, _: Dict[str, Any] = Depends(_get_admin_user)) -> AdminStatsOut:
    """Return aggregate platform statistics (admin-only)."""

    db_path = _get_db_path(request)
    try:
        with sqlite3.connect(str(db_path)) as connection:
            connection.row_factory = sqlite3.Row
            total_users = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            total_predictions = connection.execute("SELECT COUNT(*) FROM prediction_log").fetchone()[0]

            top_asset_row = connection.execute(
                """
                SELECT asset, COUNT(*) AS count
                FROM prediction_log
                GROUP BY asset
                ORDER BY count DESC
                LIMIT 1
                """
            ).fetchone()

            most_active_user_row = connection.execute(
                """
                SELECT users.username, COUNT(*) AS count
                FROM prediction_log
                JOIN users ON users.id = prediction_log.user_id
                GROUP BY users.username
                ORDER BY count DESC
                LIMIT 1
                """
            ).fetchone()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute stats",
        ) from exc

    return AdminStatsOut(
        total_users=int(total_users),
        total_predictions=int(total_predictions),
        top_asset=top_asset_row["asset"] if top_asset_row else None,
        most_active_user=most_active_user_row["username"] if most_active_user_row else None,
    )


@router.get("/assets", response_model=List[AdminAssetOut])
@limiter.limit("5/second")
def list_admin_assets(
    request: Request,
    _: Dict[str, Any] = Depends(_get_admin_user),
) -> List[AdminAssetOut]:
    """Return the supported assets with a placeholder active status."""

    return [
        AdminAssetOut(symbol=asset.symbol, name=asset.name, status="active", enabled=True)
        for asset in ASSET_METADATA
    ]


@router.delete("/users/{user_id}", response_model=AdminActionOut)
@limiter.limit("5/second")
def delete_user(
    request: Request,
    user_id: int = FastAPIPath(..., ge=1),
    current_admin: Dict[str, Any] = Depends(_get_admin_user),
) -> AdminActionOut:
    """Delete a user and their prediction history (admin-only)."""

    if int(current_admin["id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete the currently signed-in admin account",
        )

    db_path = _get_db_path(request)
    try:
        with sqlite3.connect(str(db_path)) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT id, username FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found",
                )

            connection.execute("DELETE FROM prediction_log WHERE user_id = ?", (user_id,))
            connection.execute("DELETE FROM users WHERE id = ?", (user_id,))
            connection.commit()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        ) from exc

    return AdminActionOut(detail=f"Deleted user {row['username']}")


@router.delete("/predictions", response_model=AdminActionOut)
@limiter.limit("5/second")
def clear_prediction_history(
    request: Request,
    _: Dict[str, Any] = Depends(_get_admin_user),
) -> AdminActionOut:
    """Delete all prediction history rows (admin-only)."""

    db_path = _get_db_path(request)
    try:
        with sqlite3.connect(str(db_path)) as connection:
            count = connection.execute("SELECT COUNT(*) FROM prediction_log").fetchone()[0]
            connection.execute("DELETE FROM prediction_log")
            connection.commit()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear prediction history",
        ) from exc

    return AdminActionOut(detail=f"Cleared {int(count)} prediction rows")


@router.get("/logs", response_model=AdminLogsOut)
@limiter.limit("5/second")
def get_backend_logs(
    request: Request,
    _: Dict[str, Any] = Depends(_get_admin_user),
    lines: int = Query(100, ge=1, le=1000),
) -> AdminLogsOut:
    """Return the latest backend log lines (admin-only)."""

    log_path = _default_log_path()
    if not log_path.exists():
        return AdminLogsOut(lines=[], content="")

    try:
        content = log_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load backend logs",
        ) from exc

    selected = content[-lines:]
    return AdminLogsOut(lines=selected, content="\n".join(selected))


@router.post("/retrain", response_model=AdminActionOut)
@limiter.limit("2/minute")
def retrain_model(
    request: Request,
    _: Dict[str, Any] = Depends(_get_admin_user),
) -> AdminActionOut:
    """Run the training script and reload the model (admin-only)."""

    script_path = _backend_root() / "src" / "engine" / "train.py"
    model_path = _default_model_path()
    data_dir = _default_data_dir()

    try:
        subprocess.run(
            [
                sys.executable,
                str(script_path),
                "--data-dir",
                str(data_dir),
                "--model-path",
                str(model_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.stderr.strip() or exc.stdout.strip() or "Model retraining failed",
        ) from exc

    return AdminActionOut(detail="Model retraining started and completed successfully")
