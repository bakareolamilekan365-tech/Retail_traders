from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from api.main import create_app
from api.predict import _build_insight, _serialize_indicators
from api.security import create_access_token
from engine.preprocessing import compute_indicators


class DummyModel:
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        return np.array([0.032])


def _make_df(rows: int = 120) -> pd.DataFrame:
    close_values = list(range(100, 100 + rows))
    return pd.DataFrame(
        {
            "Date": pd.date_range("2022-01-01", periods=rows, freq="D"),
            "Open": close_values,
            "High": close_values,
            "Low": close_values,
            "Close": close_values,
            "Volume": [1000.0] * rows,
        }
    )


@pytest.fixture()
def test_app(tmp_path: Path) -> TestClient:
    app = create_app(load_on_startup=False)
    data = compute_indicators(_make_df())
    app.state.data_cache = {"BTC": data, "ETH": data}
    app.state.model = DummyModel()
    app.state.database_path = tmp_path / "app.db"
    return TestClient(app)


def _auth_headers() -> dict[str, str]:
    token = create_access_token("demo", user_id=1)
    return {"Authorization": f"Bearer {token}"}


def test_assets_requires_auth(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/assets")
    assert response.status_code == 401


def test_assets_returns_list(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/assets", headers=_auth_headers())
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) == 15


def test_predict_valid_asset_returns_shape_and_logs(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/predict?asset=BTC&days=5", headers=_auth_headers())
    assert response.status_code == 200
    payload = response.json()

    assert payload["asset"] == "BTC"
    assert len(payload["ohlcv"]) == 5
    assert len(payload["indicators"]) == 5
    assert payload["prediction"]["signal"] in {"BUY", "SELL", "HOLD"}
    assert "insight" in payload

    db_path = test_app.app.state.database_path
    with sqlite3.connect(db_path) as connection:
        count = connection.execute("SELECT COUNT(*) FROM prediction_log").fetchone()[0]
    assert count == 1


def test_prediction_history_returns_authenticated_user_rows(test_app: TestClient) -> None:
    db_path = test_app.app.state.database_path
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            CREATE TABLE prediction_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                asset TEXT NOT NULL,
                signal TEXT NOT NULL,
                expected_return REAL NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (1, "BTC", "BUY", 2.5, 0.75, "2024-01-02T00:00:00"),
        )
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (2, "ETH", "SELL", -2.5, 0.72, "2024-01-03T00:00:00"),
        )
        connection.commit()

    response = test_app.get("/api/v1/predictions/history", headers=_auth_headers())
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["asset"] == "BTC"
    assert payload[0]["signal"] == "BUY"


def test_predict_invalid_asset_returns_404(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/predict?asset=INVALID&days=5", headers=_auth_headers())
    assert response.status_code == 404


def test_predict_without_auth_returns_401(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/predict?asset=BTC&days=5")
    assert response.status_code == 401


def test_predict_smoke_token_flow(test_app: TestClient) -> None:
    response = test_app.get("/api/v1/predict?asset=BTC&days=3", headers=_auth_headers())
    assert response.status_code == 200


def test_insight_uses_oversold_threshold_at_rsi_30() -> None:
    latest_row = pd.Series(
        {
            "SMA_14": 101.0,
            "SMA_50": 100.0,
            "RSI_14": 30.0,
            "Volatility_14": 2.8,
            "Close": 100.0,
        }
    )

    insight = _build_insight(
        latest_row=latest_row,
        signal="HOLD",
        expected_return_pct=0.4,
        confidence=0.6,
    )

    assert "oversold momentum" in insight.lower()


def test_insight_mentions_signal_trend_conflict() -> None:
    latest_row = pd.Series(
        {
            "SMA_14": 120.0,
            "SMA_50": 100.0,
            "RSI_14": 55.0,
            "Volatility_14": 3.0,
            "Close": 100.0,
        }
    )

    insight = _build_insight(
        latest_row=latest_row,
        signal="SELL",
        expected_return_pct=-2.4,
        confidence=0.78,
    )

    assert "signal conflict" in insight.lower()
    assert "sell" in insight.lower()
    assert "bullish" in insight.lower()


def test_serialize_indicators_outputs_relative_volatility_percent() -> None:
    frame = pd.DataFrame(
        {
            "Date": pd.date_range("2025-01-01", periods=1, freq="D"),
            "SMA_14": [100.0],
            "SMA_50": [95.0],
            "SMA_Crossover": [1],
            "RSI_14": [50.0],
            "Volatility_14": [2.5],
            "Close": [100.0],
        }
    )

    serialized = _serialize_indicators(frame)
    assert len(serialized) == 1
    assert serialized[0].volatility_14 == pytest.approx(2.5)
