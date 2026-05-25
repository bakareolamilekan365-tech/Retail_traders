from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

import engine.preprocessing as preprocessing
from engine.preprocessing import compute_indicators, load_and_preprocess


def _make_df(close_values: list[float], volume_values: list[float] | None = None) -> pd.DataFrame:
    size = len(close_values)
    volumes = volume_values if volume_values is not None else [100.0] * size
    return pd.DataFrame(
        {
            "Date": pd.date_range("2024-01-01", periods=size, freq="D"),
            "Open": close_values,
            "High": close_values,
            "Low": close_values,
            "Close": close_values,
            "Volume": volumes,
        }
    )


def test_compute_indicators_known_values() -> None:
    close_values = list(range(1, 61))
    df = _make_df(close_values)
    result = compute_indicators(df)

    assert result["SMA_14"].iloc[13] == pytest.approx(7.5)
    assert result["SMA_50"].iloc[49] == pytest.approx(25.5)
    assert result["SMA_Crossover"].iloc[49] == 1

    expected_vol = pd.Series(close_values).rolling(window=14, min_periods=14).std().iloc[13]
    assert result["Volatility_14"].iloc[13] == pytest.approx(expected_vol)
    assert result["RSI_14"].iloc[13] == pytest.approx(100.0)


def test_zero_volume_rows_do_not_affect_indicators() -> None:
    close_values = list(range(1, 21))
    zero_volumes = [0.0 if idx % 2 == 0 else 100.0 for idx in range(len(close_values))]
    df_zero = _make_df(close_values, zero_volumes)
    df_normal = _make_df(close_values)

    result_zero = compute_indicators(df_zero)
    result_normal = compute_indicators(df_normal)

    pd.testing.assert_series_equal(result_zero["SMA_14"], result_normal["SMA_14"])


def test_flat_prices_rsi_is_nan() -> None:
    close_values = [100.0] * 20
    df = _make_df(close_values)
    result = compute_indicators(df)

    assert np.isnan(result["RSI_14"].iloc[13])


def test_sma_50_nan_when_insufficient_rows() -> None:
    close_values = list(range(1, 31))
    df = _make_df(close_values)
    result = compute_indicators(df)

    assert result["SMA_50"].isna().all()


def test_missing_close_values_are_dropped_with_warning(tmp_path: Path) -> None:
    df = _make_df([1.0, np.nan, 3.0, 4.0, 5.0])
    csv_path = tmp_path / "sample.csv"
    df.to_csv(csv_path, index=False)

    with pytest.warns(RuntimeWarning, match="Missing values found"):
        cleaned = load_and_preprocess(str(csv_path))

    assert cleaned["Close"].isna().sum() == 0
    assert len(cleaned) == 4


def test_load_and_preprocess_file_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    def _raise_file_not_found(*_args: object, **_kwargs: object) -> pd.DataFrame:
        raise FileNotFoundError("missing.csv")

    monkeypatch.setattr(preprocessing.pd, "read_csv", _raise_file_not_found)

    with pytest.raises(FileNotFoundError, match="CSV file not found"):
        load_and_preprocess("missing.csv")


def test_load_and_preprocess_empty_dataframe(monkeypatch: pytest.MonkeyPatch) -> None:
    def _return_empty(*_args: object, **_kwargs: object) -> pd.DataFrame:
        return pd.DataFrame()

    monkeypatch.setattr(preprocessing.pd, "read_csv", _return_empty)

    with pytest.raises(ValueError, match="contains no rows"):
        load_and_preprocess("empty.csv")


def test_smoke_load_and_compute_indicators(tmp_path: Path) -> None:
    df = _make_df(list(range(1, 61)))
    csv_path = tmp_path / "smoke.csv"
    df.to_csv(csv_path, index=False)

    loaded = load_and_preprocess(str(csv_path))
    result = compute_indicators(loaded)

    for column in ["SMA_14", "SMA_50", "SMA_Crossover", "RSI_14", "Volatility_14"]:
        assert column in result.columns
