"""Utility for downloading real historical OHLCV data via yfinance."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List

import pandas as pd
import requests
import yfinance as yf

LOGGER = logging.getLogger(__name__)

START_DATE = "2022-01-01"
END_DATE = "2025-01-01"
FINAL_DATE = "2024-12-31"


@dataclass(frozen=True)
class TickerConfig:
    """Mapping from internal asset symbol to yfinance ticker."""

    symbol: str
    ticker: str


TICKER_CONFIGS: List[TickerConfig] = [
    TickerConfig("BTC", "BTC-USD"),
    TickerConfig("ETH", "ETH-USD"),
    TickerConfig("BNB", "BNB-USD"),
    TickerConfig("SOL", "SOL-USD"),
    TickerConfig("ADA", "ADA-USD"),
    TickerConfig("DANGCEM", "DANGCEM.LG"),
    TickerConfig("MTNN", "MTNN.LG"),
    TickerConfig("AIRTELAFRI", "AIRTELAFRI.LG"),
    TickerConfig("BUACEMENT", "BUACEMENT.LG"),
    TickerConfig("GTCO", "GTCO.LG"),
    TickerConfig("ZENITHBANK", "ZENITHBANK.LG"),
    TickerConfig("SEPLAT", "SEPLAT.LG"),
    TickerConfig("NB", "NB.LG"),
    TickerConfig("FBNH", "FBNH.LG"),
    TickerConfig("ACCESSCORP", "ACCESSCORP.LG"),
]


def _normalize_downloaded_data(raw: pd.DataFrame) -> pd.DataFrame:
    if raw.empty:
        raise ValueError("Downloaded data is empty.")

    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)

    if raw.index.tz is not None:
        raw.index = raw.index.tz_localize(None)

    required_columns = ["Open", "High", "Low", "Close", "Volume"]
    missing_columns = [column for column in required_columns if column not in raw.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    cleaned = raw.loc[:, required_columns].copy()
    cleaned = cleaned.loc[cleaned.index <= FINAL_DATE]
    cleaned.reset_index(inplace=True)
    cleaned.rename(columns={"index": "Date"}, inplace=True)
    cleaned = cleaned.loc[:, ["Date", "Open", "High", "Low", "Close", "Volume"]]
    return cleaned


def download_all_assets(output_dir: str | Path | None = None) -> List[Path]:
    """Download 3 years of daily OHLCV for all assets.

    Args:
        output_dir: Directory to write CSV files. Defaults to /backend/data.

    Returns:
        List of generated CSV file paths.
    """
    if output_dir is None:
        output_dir = Path(__file__).resolve().parents[2] / "data"

    output_path = Path(output_dir).expanduser().resolve()
    output_path.mkdir(parents=True, exist_ok=True)

    written_files: List[Path] = []

    for config in TICKER_CONFIGS:
        try:
            raw = yf.download(
                config.ticker,
                start=START_DATE,
                end=END_DATE,
                interval="1d",
                progress=False,
                auto_adjust=False,
            )
        except (ValueError, KeyError, requests.exceptions.RequestException) as exc:
            LOGGER.warning("Failed to download %s (%s): %s", config.symbol, config.ticker, exc)
            continue

        if raw.empty:
            LOGGER.warning("No data returned for %s (%s).", config.symbol, config.ticker)
            continue

        try:
            normalized = _normalize_downloaded_data(raw)
        except ValueError as exc:
            LOGGER.warning("Skipping %s (%s): %s", config.symbol, config.ticker, exc)
            continue

        if normalized.empty:
            LOGGER.warning("No valid rows after filtering for %s (%s).", config.symbol, config.ticker)
            continue

        output_file = output_path / f"{config.symbol}.csv"
        normalized.to_csv(output_file, index=False)
        written_files.append(output_file)

    return written_files


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    download_all_assets()
