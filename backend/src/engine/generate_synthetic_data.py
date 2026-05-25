"""Synthetic OHLCV data generation for all demo assets."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class AssetConfig:
    """Configuration for synthetic asset generation."""

    symbol: str
    start_price: float
    annual_drift: float
    annual_volatility: float
    volume_base: float


ASSET_CONFIGS: List[AssetConfig] = [
    AssetConfig("BTC", 30000.0, 0.18, 0.70, 85000.0),
    AssetConfig("ETH", 2000.0, 0.20, 0.75, 120000.0),
    AssetConfig("BNB", 300.0, 0.16, 0.60, 90000.0),
    AssetConfig("SOL", 80.0, 0.22, 0.85, 110000.0),
    AssetConfig("ADA", 0.4, 0.14, 0.65, 150000.0),
    AssetConfig("DANGCEM", 650.0, 0.10, 0.35, 2200000.0),
    AssetConfig("MTNN", 250.0, 0.11, 0.32, 1800000.0),
    AssetConfig("AIRTELAFRI", 1700.0, 0.09, 0.30, 900000.0),
    AssetConfig("BUACEMENT", 120.0, 0.10, 0.36, 2000000.0),
    AssetConfig("GTCO", 25.0, 0.08, 0.28, 3500000.0),
    AssetConfig("ZENITHBANK", 32.0, 0.08, 0.27, 4200000.0),
    AssetConfig("SEPLAT", 1800.0, 0.12, 0.40, 500000.0),
    AssetConfig("FBNH", 18.0, 0.07, 0.30, 3000000.0),
    AssetConfig("NB", 60.0, 0.09, 0.33, 1500000.0),
    AssetConfig("ACCESSCORP", 18.0, 0.08, 0.29, 3200000.0),
]


def _simulate_gbm(
    start_price: float,
    days: int,
    annual_drift: float,
    annual_volatility: float,
    rng: np.random.Generator,
) -> np.ndarray:
    if start_price <= 0:
        raise ValueError("start_price must be positive.")
    if days <= 0:
        raise ValueError("days must be positive.")
    if annual_volatility <= 0:
        raise ValueError("annual_volatility must be positive.")

    dt = 1.0 / 365.0
    drift = (annual_drift - 0.5 * annual_volatility**2) * dt
    shock_scale = annual_volatility * np.sqrt(dt)

    shocks = rng.normal(loc=drift, scale=shock_scale, size=days - 1)
    log_returns = np.concatenate([[0.0], shocks])
    prices = start_price * np.exp(np.cumsum(log_returns))
    return prices


def _build_ohlcv(
    close_prices: np.ndarray,
    volume_base: float,
    rng: np.random.Generator,
) -> pd.DataFrame:
    if close_prices.size == 0:
        raise ValueError("close_prices must contain at least one value.")
    if volume_base <= 0:
        raise ValueError("volume_base must be positive.")

    open_prices = np.concatenate([[close_prices[0]], close_prices[:-1]])
    range_pct = rng.uniform(0.002, 0.02, size=close_prices.size)
    high_prices = np.maximum(open_prices, close_prices) * (1 + range_pct)
    low_prices = np.minimum(open_prices, close_prices) * (1 - range_pct)

    volumes = rng.lognormal(mean=np.log(volume_base), sigma=0.25, size=close_prices.size)
    volumes = np.round(volumes, 2)

    return pd.DataFrame(
        {
            "Open": open_prices,
            "High": high_prices,
            "Low": low_prices,
            "Close": close_prices,
            "Volume": volumes,
        }
    )


def generate_all_assets(output_dir: str | Path | None = None, seed: int = 42) -> Path:
    """Generate synthetic OHLCV CSVs for all assets.

    Args:
        output_dir: Directory to write CSV files. Defaults to /backend/data.
        seed: Random seed for deterministic generation.

    Returns:
        Path to the output directory containing generated CSVs.
    """
    if output_dir is None:
        output_dir = Path(__file__).resolve().parents[2] / "data"

    output_path = Path(output_dir).expanduser().resolve()
    output_path.mkdir(parents=True, exist_ok=True)

    date_index = pd.date_range("2022-01-01", "2024-12-31", freq="D")
    rng = np.random.default_rng(seed)

    for config in ASSET_CONFIGS:
        close_prices = _simulate_gbm(
            start_price=config.start_price,
            days=len(date_index),
            annual_drift=config.annual_drift,
            annual_volatility=config.annual_volatility,
            rng=rng,
        )
        ohlcv = _build_ohlcv(close_prices, config.volume_base, rng)
        ohlcv.insert(0, "Date", date_index)

        output_file = output_path / f"{config.symbol}.csv"
        try:
            ohlcv.to_csv(output_file, index=False)
        except OSError as exc:
            raise OSError(f"Failed to write CSV for {config.symbol}: {exc}") from exc

    return output_path


if __name__ == "__main__":
    generate_all_assets()
