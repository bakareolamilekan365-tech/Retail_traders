from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import pytest
from joblib import load
from sklearn.ensemble import RandomForestRegressor

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from engine.train import create_labels, prepare_features, train_model


def _make_df(size: int = 80) -> pd.DataFrame:
    close_values = list(range(1, size + 1))
    return pd.DataFrame(
        {
            "Date": pd.date_range("2024-01-01", periods=size, freq="D"),
            "Open": close_values,
            "High": close_values,
            "Low": close_values,
            "Close": close_values,
            "Volume": [100.0] * size,
        }
    )


def test_prepare_features_creates_lagged_and_rolling_columns() -> None:
    df = _make_df(60)
    features = prepare_features(df)

    expected_columns = {
        "Close",
        "Volume",
        "SMA_14",
        "SMA_50",
        "SMA_Crossover",
        "RSI_14",
        "Volatility_14",
        "Return_1d",
        "Lag_Return_1",
        "Lag_Return_2",
        "Lag_Return_3",
        "Rolling_Return_Mean_7",
        "Rolling_Return_Std_7",
    }
    assert expected_columns.issubset(features.columns)

    assert features["Return_1d"].iloc[1] == pytest.approx(1.0)
    assert features["Lag_Return_1"].iloc[2] == pytest.approx(1.0)


def test_prepare_features_missing_required_columns_raises() -> None:
    df = pd.DataFrame({"Close": [1.0, 2.0]})
    with pytest.raises(ValueError, match="Missing required columns"):
        prepare_features(df)


def test_create_labels_future_return() -> None:
    df = pd.DataFrame({"Close": [100.0, 105.0, 110.0, 120.0]})
    labels = create_labels(df, forward_days=2)

    assert labels.iloc[0] == pytest.approx(0.1)
    assert labels.iloc[1] == pytest.approx((120.0 - 105.0) / 105.0)
    assert labels.isna().iloc[2]
    assert labels.isna().iloc[3]


def test_create_labels_invalid_forward_days_raises() -> None:
    df = pd.DataFrame({"Close": [100.0, 101.0]})
    with pytest.raises(ValueError, match="forward_days must be a positive integer"):
        create_labels(df, forward_days=0)


def test_train_model_saves_and_loads(tmp_path: Path) -> None:
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    model_path = tmp_path / "model.joblib"

    df = _make_df(80)
    csv_path = data_dir / "asset.csv"
    df.to_csv(csv_path, index=False)

    model = train_model(str(data_dir), str(model_path))

    assert model_path.exists()
    loaded = load(model_path)
    assert isinstance(loaded, RandomForestRegressor)

    features = prepare_features(df).dropna()
    prediction = loaded.predict(features.tail(1))
    assert len(prediction) == 1


def test_train_model_no_csvs_raises(tmp_path: Path) -> None:
    data_dir = tmp_path / "empty"
    data_dir.mkdir()
    with pytest.raises(ValueError, match="No CSV files found"):
        train_model(str(data_dir), str(tmp_path / "model.joblib"))
