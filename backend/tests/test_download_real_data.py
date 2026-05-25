from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import pytest

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

import engine.download_real_data as download_real_data


def _sample_dataframe() -> pd.DataFrame:
    dates = pd.date_range("2022-01-01", periods=3, freq="D")
    return pd.DataFrame(
        {
            "Open": [100.0, 101.0, 102.0],
            "High": [105.0, 106.0, 107.0],
            "Low": [95.0, 96.0, 97.0],
            "Close": [102.0, 103.0, 104.0],
            "Adj Close": [102.0, 103.0, 104.0],
            "Volume": [1000.0, 1100.0, 1200.0],
        },
        index=dates,
    )


def test_download_all_assets_writes_csvs(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    sample_df = _sample_dataframe()

    def _fake_download(*_args: object, **_kwargs: object) -> pd.DataFrame:
        return sample_df

    monkeypatch.setattr(download_real_data.yf, "download", _fake_download)

    test_configs = [
        download_real_data.TickerConfig("BTC", "BTC-USD"),
        download_real_data.TickerConfig("ETH", "ETH-USD"),
    ]
    monkeypatch.setattr(download_real_data, "TICKER_CONFIGS", test_configs)

    written_files = download_real_data.download_all_assets(output_dir=tmp_path)

    assert len(written_files) == len(test_configs)
    for config in test_configs:
        csv_path = tmp_path / f"{config.symbol}.csv"
        df = pd.read_csv(csv_path)
        assert df.columns.tolist() == ["Date", "Open", "High", "Low", "Close", "Volume"]
        assert len(df) == 3


def test_download_all_assets_skips_missing_ticker(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    sample_df = _sample_dataframe()

    def _fake_download(ticker: str, *_args: object, **_kwargs: object) -> pd.DataFrame:
        if ticker == "MISSING":
            return pd.DataFrame()
        return sample_df

    monkeypatch.setattr(download_real_data.yf, "download", _fake_download)

    test_configs = [
        download_real_data.TickerConfig("BTC", "BTC-USD"),
        download_real_data.TickerConfig("MISS", "MISSING"),
    ]
    monkeypatch.setattr(download_real_data, "TICKER_CONFIGS", test_configs)

    written_files = download_real_data.download_all_assets(output_dir=tmp_path)

    assert len(written_files) == 1
    assert (tmp_path / "BTC.csv").exists()
    assert not (tmp_path / "MISS.csv").exists()
