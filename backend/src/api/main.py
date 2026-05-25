"""FastAPI application entry point."""

from __future__ import annotations

import logging
import os
import sys
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

from api.assets import ASSET_METADATA, router as assets_router
from api.limiter import limiter
from api.predict import router as predict_router
from engine.preprocessing import compute_indicators, load_and_preprocess

LOGGER = logging.getLogger(__name__)

DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173"


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
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(assets_router)
    app.include_router(predict_router)

    app.state.data_cache = {}
    app.state.model = None
    app.state.database_path = _resolve_database_path()

    if load_on_startup:

        @app.on_event("startup")
        async def startup_event() -> None:
            data_dir = Path(__file__).resolve().parents[2] / "data"
            model_path = Path(os.getenv("MODEL_PATH", str(Path(__file__).resolve().parents[2] / "model.joblib")))
            asset_symbols = [asset.symbol for asset in ASSET_METADATA]

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
