"""Prediction endpoint for asset analytics."""

from __future__ import annotations

import logging
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field

from api.limiter import limiter
from api.security import get_current_user

BACKEND_SRC = Path(__file__).resolve().parents[1]
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from engine.preprocessing import compute_indicators
from engine.train import prepare_features

LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["predict"])


class OHLCVRow(BaseModel):
    """OHLCV row for time series output."""

    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class IndicatorRow(BaseModel):
    """Indicator row for time series output."""

    date: str
    sma_14: float | None
    sma_50: float | None
    sma_crossover: int
    rsi_14: float | None
    volatility_14: float | None


class PredictionOut(BaseModel):
    """Prediction summary output."""

    signal: str = Field(..., description="BUY, SELL, or HOLD signal")
    expected_return_7d: float = Field(..., description="Expected 7-day return (%)")
    confidence: float = Field(..., description="Prediction confidence (0-1)")


class PredictionHistoryOut(BaseModel):
    """Prediction history row for the authenticated user."""

    id: int
    asset: str
    signal: str
    expected_return: float
    confidence: float
    timestamp: str


class PredictResponse(BaseModel):
    """Full prediction response payload."""

    asset: str
    timestamp: str
    ohlcv: List[OHLCVRow]
    indicators: List[IndicatorRow]
    prediction: PredictionOut
    insight: str


def _to_optional_float(value: float) -> float | None:
    if pd.isna(value):
        return None
    return float(value)


def _serialize_ohlcv(df: pd.DataFrame) -> List[OHLCVRow]:
    rows: List[OHLCVRow] = []
    for _, row in df.iterrows():
        rows.append(
            OHLCVRow(
                date=pd.to_datetime(row["Date"]).strftime("%Y-%m-%d"),
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                volume=float(row["Volume"]),
            )
        )
    return rows


def _serialize_indicators(df: pd.DataFrame) -> List[IndicatorRow]:
    rows: List[IndicatorRow] = []
    for _, row in df.iterrows():
        volatility = row.get("Volatility_14")
        close = row.get("Close")
        if pd.isna(volatility) or pd.isna(close) or close == 0:
            volatility_pct = None
        else:
            volatility_pct = float((volatility / close) * 100)

        rows.append(
            IndicatorRow(
                date=pd.to_datetime(row["Date"]).strftime("%Y-%m-%d"),
                sma_14=_to_optional_float(row["SMA_14"]),
                sma_50=_to_optional_float(row["SMA_50"]),
                sma_crossover=int(row["SMA_Crossover"]),
                rsi_14=_to_optional_float(row["RSI_14"]),
                volatility_14=volatility_pct,
            )
        )
    return rows


def _map_signal(predicted_return: float) -> str:
    if predicted_return > 0.02:
        return "BUY"
    if predicted_return < -0.02:
        return "SELL"
    return "HOLD"


def _estimate_confidence(predicted_return: float) -> float:
    magnitude = min(abs(predicted_return) / 0.1, 0.3)
    confidence = 0.5 + magnitude
    return float(min(max(confidence, 0.55), 0.85))


def _build_insight(
    latest_row: pd.Series,
    signal: str,
    expected_return_pct: float,
    confidence: float,
) -> str:
    sma_14 = latest_row.get("SMA_14")
    sma_50 = latest_row.get("SMA_50")
    rsi = latest_row.get("RSI_14")
    volatility = latest_row.get("Volatility_14")
    close = latest_row.get("Close")

    if pd.isna(sma_14) or pd.isna(sma_50):
        trend_state = "unknown"
        trend_clause = "Trend data is insufficient to confirm direction."
    elif sma_14 > sma_50:
        trend_state = "bullish"
        trend_clause = "Short-term uptrend confirmed by SMA 14 crossing above SMA 50."
    elif sma_14 < sma_50:
        trend_state = "bearish"
        trend_clause = "Short-term downtrend indicated by SMA 14 staying below SMA 50."
    else:
        trend_state = "neutral"
        trend_clause = "Trend is neutral with SMA 14 aligned to SMA 50."

    if pd.isna(rsi):
        momentum_clause = "RSI data is insufficient to assess momentum."
    elif rsi <= 30:
        momentum_clause = f"RSI at {rsi:.1f} indicates oversold momentum."
    elif rsi > 70:
        momentum_clause = f"RSI at {rsi:.1f} indicates overbought momentum."
    else:
        momentum_clause = f"RSI at {rsi:.1f} indicates neutral momentum."

    if pd.isna(volatility) or pd.isna(close) or close == 0:
        risk_clause = "Volatility data is insufficient to assess risk."
    else:
        volatility_pct = (volatility / close) * 100
        if volatility_pct < 1.5:
            risk_clause = f"Volatility is low ({volatility_pct:.1f}%)."
        elif volatility_pct < 3:
            risk_clause = f"Volatility is moderate ({volatility_pct:.1f}%)."
        else:
            risk_clause = f"Volatility is elevated ({volatility_pct:.1f}%)."

    if signal == "SELL" and trend_state == "bullish":
        reconciliation_clause = (
            "Signal conflict detected: the model leans defensive (SELL) while "
            "SMA trend remains bullish."
        )
    elif signal == "BUY" and trend_state == "bearish":
        reconciliation_clause = (
            "Signal conflict detected: the model turns constructive (BUY) while "
            "SMA trend remains bearish."
        )
    else:
        reconciliation_clause = ""

    model_clause = (
        f"Our model recommends a {signal} with an expected 7-day return of "
        f"{expected_return_pct:+.1f}% (confidence {confidence:.0%})."
    )

    clauses = [trend_clause, momentum_clause, risk_clause, model_clause]
    if reconciliation_clause:
        clauses.append(reconciliation_clause)
    return " ".join(clauses)


def _log_prediction(
    db_path: Path,
    user_id: int | None,
    asset: str,
    signal: str,
    expected_return_pct: float,
    confidence: float,
) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS prediction_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    asset TEXT NOT NULL,
                    signal TEXT NOT NULL,
                    expected_return REAL NOT NULL,
                    confidence REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.execute(
                """
                INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    asset,
                    signal,
                    expected_return_pct,
                    confidence,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            connection.commit()
    except sqlite3.Error as exc:
        LOGGER.warning("Failed to log prediction for %s: %s", asset, exc)


def _get_user_id_from_claims(db_path: Path, current_user: Dict[str, Any]) -> int | None:
    user_id = current_user.get("user_id")
    if isinstance(user_id, int):
        return user_id

    username = current_user.get("sub")
    if not username:
        return None

    try:
        with sqlite3.connect(db_path) as connection:
            row = connection.execute(
                "SELECT id FROM users WHERE username = ?",
                (username,),
            ).fetchone()
    except sqlite3.Error as exc:
        LOGGER.warning("Failed to resolve user id for history: %s", exc)
        return None

    return int(row[0]) if row else None


@router.get("/predictions/history", response_model=List[PredictionHistoryOut])
@limiter.limit("5/second")
def prediction_history(
    request: Request,
    limit: int = Query(25, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[PredictionHistoryOut]:
    """Return recent prediction rows for the authenticated user."""

    db_path = getattr(request.app.state, "database_path", None)
    if db_path is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )

    resolved_db_path = Path(db_path)
    user_id = _get_user_id_from_claims(resolved_db_path, current_user)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    try:
        with sqlite3.connect(resolved_db_path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                """
                SELECT id, asset, signal, expected_return, confidence, timestamp
                FROM prediction_log
                WHERE user_id = ?
                ORDER BY timestamp DESC, id DESC
                LIMIT ?
                """,
                (user_id, limit),
            ).fetchall()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load prediction history",
        ) from exc

    return [PredictionHistoryOut(**dict(row)) for row in rows]


@router.get("/predict", response_model=PredictResponse)
@limiter.limit("5/second")
def predict_asset(
    request: Request,
    asset: str = Query(..., min_length=1),
    days: int = Query(180, ge=1),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> PredictResponse:
    """Return OHLCV, indicators, prediction, and insight for the requested asset."""
    data_cache: Dict[str, pd.DataFrame] = getattr(request.app.state, "data_cache", {})
    if asset not in data_cache:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    data = data_cache[asset].copy()
    if data.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset data unavailable")

    indicator_columns = {"SMA_14", "SMA_50", "SMA_Crossover", "RSI_14", "Volatility_14"}
    if not indicator_columns.issubset(data.columns):
        try:
            data = compute_indicators(data)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Indicator computation failed",
            ) from exc

    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model not loaded",
        )

    feature_frame = prepare_features(data).dropna()
    if feature_frame.empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Not enough data to generate prediction features",
        )

    latest_features = feature_frame.tail(1)
    try:
        predicted_return = float(np.asarray(model.predict(latest_features))[0])
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model prediction failed",
        ) from exc

    signal = _map_signal(predicted_return)
    expected_return_pct = round(predicted_return * 100, 2)
    confidence = round(_estimate_confidence(predicted_return), 2)
    latest_row = data.iloc[-1]
    insight = _build_insight(latest_row, signal, expected_return_pct, confidence)

    subset = data.tail(min(days, len(data)))
    response = PredictResponse(
        asset=asset,
        timestamp=datetime.now(timezone.utc).isoformat(),
        ohlcv=_serialize_ohlcv(subset),
        indicators=_serialize_indicators(subset),
        prediction=PredictionOut(
            signal=signal,
            expected_return_7d=expected_return_pct,
            confidence=confidence,
        ),
        insight=insight,
    )

    db_path = getattr(request.app.state, "database_path", None)
    if isinstance(db_path, Path):
        user_id = current_user.get("user_id")
        _log_prediction(db_path, user_id, asset, signal, expected_return_pct, confidence)

    return response
