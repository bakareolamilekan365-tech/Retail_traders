"""Admin-only monitoring endpoints for users, predictions, and system stats."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, EmailStr, Field

from api.limiter import limiter
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
