"""FastAPI application entry point."""

from __future__ import annotations

import logging
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from joblib import load
from sklearn.ensemble import RandomForestRegressor
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

BACKEND_SRC = Path(__file__).resolve().parents[1]
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from api.admin import router as admin_router
from api.assets import ASSET_METADATA, router as assets_router
from api.auth import router as auth_router, hash_password
from api.limiter import limiter
from api.predict import router as predict_router
from engine.preprocessing import compute_indicators, load_and_preprocess

LOGGER = logging.getLogger(__name__)

DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173"
DEFAULT_FRONTEND_ORIGIN_REGEX = r"http://(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):5173"


def _setup_logging(log_dir: Path) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)
    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    root_logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    root_logger.addHandler(stream_handler)

    file_handler = logging.FileHandler(log_dir / "app.log")
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)


def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


def _resolve_database_path() -> Path:
    default_path = Path(__file__).resolve().parents[2] / "data" / "app.db"
    raw = os.getenv("DATABASE_URL", str(default_path))
    if raw.startswith("sqlite:///"):
        raw = raw.replace("sqlite:///", "", 1)
    elif raw.startswith("sqlite://"):
        raw = raw.replace("sqlite://", "", 1)
    return Path(raw).expanduser().resolve()


def _initialize_database(db_path: Path) -> None:
    """Initialize database schema and seed users."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)
    
    # Create prediction_log table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS prediction_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            asset TEXT NOT NULL,
            signal TEXT NOT NULL,
            expected_return REAL NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )
    
    conn.commit()
    
    # Seed admin user
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_hash = hash_password(admin_password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
            ("admin", "admin@example.com", admin_hash, True, datetime.utcnow().isoformat())
        )
        LOGGER.info("Admin user seeded")
    except sqlite3.IntegrityError:
        LOGGER.info("Admin user already exists")
    
    # Seed demo user
    demo_hash = hash_password("demo123")
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
            ("demo", "demo@example.com", demo_hash, False, datetime.utcnow().isoformat())
        )
        LOGGER.info("Demo user seeded")
    except sqlite3.IntegrityError:
        LOGGER.info("Demo user already exists")
    
    demo_user_row = cursor.execute(
        "SELECT id FROM users WHERE username = ?",
        ("demo",),
    ).fetchone()
    demo_user_id = demo_user_row[0] if demo_user_row else None

    # Seed 10 prediction history rows for demo user
    if demo_user_id is not None:
        demo_predictions = [
            (demo_user_id, "BTC", "BUY", 2.5, 0.75, datetime.utcnow().isoformat()),
            (demo_user_id, "ETH", "HOLD", -1.2, 0.55, datetime.utcnow().isoformat()),
            (demo_user_id, "BNB", "HOLD", 1.8, 0.60, datetime.utcnow().isoformat()),
            (demo_user_id, "SOL", "BUY", 3.1, 0.81, datetime.utcnow().isoformat()),
            (demo_user_id, "ADA", "HOLD", -0.5, 0.50, datetime.utcnow().isoformat()),
            (demo_user_id, "DANGCEM", "BUY", 2.2, 0.72, datetime.utcnow().isoformat()),
            (demo_user_id, "MTNN", "SELL", -2.1, 0.71, datetime.utcnow().isoformat()),
            (demo_user_id, "AIRTELAFRI", "HOLD", 0.8, 0.54, datetime.utcnow().isoformat()),
            (demo_user_id, "BUACEMENT", "HOLD", 1.5, 0.58, datetime.utcnow().isoformat()),
            (demo_user_id, "GTCO", "BUY", 2.9, 0.79, datetime.utcnow().isoformat()),
        ]

        cursor.execute("DELETE FROM prediction_log WHERE user_id = ?", (demo_user_id,))
        for user_id, asset, signal, expected_return, confidence, ts in demo_predictions:
            try:
                cursor.execute(
                    """
                    INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (user_id, asset, signal, expected_return, confidence, ts),
                )
            except sqlite3.IntegrityError:
                pass
    else:
        LOGGER.warning("Demo user ID not found; skipping prediction seed data.")
    
    conn.commit()
    conn.close()
    LOGGER.info("Database initialized and seeded")



def _load_data_cache(data_dir: Path, asset_symbols: List[str]) -> Dict[str, pd.DataFrame]:
    data_cache: Dict[str, pd.DataFrame] = {}
    for symbol in asset_symbols:
        csv_path = data_dir / f"{symbol}.csv"
        if not csv_path.exists():
            LOGGER.warning("Missing CSV for asset %s at %s", symbol, csv_path)
            continue
        try:
            raw = load_and_preprocess(str(csv_path))
            enriched = compute_indicators(raw)
        except (FileNotFoundError, ValueError, pd.errors.ParserError) as exc:
            LOGGER.warning("Skipping %s due to data error: %s", symbol, exc)
            continue
        data_cache[symbol] = enriched
    if not data_cache:
        LOGGER.warning("No asset data loaded from %s", data_dir)
    return data_cache


def _load_model(model_path: Path) -> RandomForestRegressor:
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    try:
        model = load(model_path)
    except (OSError, ValueError) as exc:
        raise RuntimeError(f"Failed to load model from {model_path}: {exc}") from exc
    if not isinstance(model, RandomForestRegressor):
        raise RuntimeError("Loaded model is not a RandomForestRegressor.")
    return model


def create_app(load_on_startup: bool = True) -> FastAPI:
    app = FastAPI(title="Intelligent Investment Recommendation Assistant")

    log_dir = Path(__file__).resolve().parents[2] / "logs"
    _setup_logging(log_dir)

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)
    app.add_middleware(SlowAPIMiddleware)

    frontend_origin = os.getenv("FRONTEND_ORIGIN", DEFAULT_FRONTEND_ORIGIN)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[frontend_origin],
        allow_origin_regex=DEFAULT_FRONTEND_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(assets_router)
    app.include_router(predict_router)
    app.include_router(admin_router)

    app.state.data_cache = {}
    app.state.model = None
    app.state.database_path = _resolve_database_path()

    if load_on_startup:

        @app.on_event("startup")
        async def startup_event() -> None:
            data_dir = Path(__file__).resolve().parents[2] / "data"
            model_path = Path(os.getenv("MODEL_PATH", str(Path(__file__).resolve().parents[2] / "model.joblib")))
            asset_symbols = [asset.symbol for asset in ASSET_METADATA]

            # Initialize database
            _initialize_database(app.state.database_path)

            app.state.data_cache = _load_data_cache(data_dir, asset_symbols)
            try:
                app.state.model = _load_model(model_path)
            except (FileNotFoundError, RuntimeError) as exc:
                LOGGER.error("Startup failed: %s", exc)
                raise

    @app.get("/health")
    def health_check() -> Dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
