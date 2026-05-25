"""Data preprocessing and technical indicator computation for OHLCV CSV data."""

from __future__ import annotations

import warnings
from typing import List

import pandas as pd

REQUIRED_COLUMNS: List[str] = ["Date", "Open", "High", "Low", "Close", "Volume"]


def load_and_preprocess(filepath: str) -> pd.DataFrame:
    """Load a CSV file and validate/clean OHLCV data.

    Args:
        filepath: Path to the CSV file.

    Returns:
        Cleaned DataFrame with required columns and parsed dtypes.

    Raises:
        ValueError: If the file is empty, invalid, or missing required columns.
        FileNotFoundError: If the CSV file does not exist.
    """
    if not isinstance(filepath, str) or not filepath.strip():
        raise ValueError("filepath must be a non-empty string.")

    try:
        df = pd.read_csv(filepath)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"CSV file not found: {filepath}") from exc
    except pd.errors.EmptyDataError as exc:
        raise ValueError(f"CSV file is empty: {filepath}") from exc

    if df.empty:
        raise ValueError(f"CSV file contains no rows: {filepath}")

    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    for column in [col for col in REQUIRED_COLUMNS if col != "Date"]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    missing_mask = df[REQUIRED_COLUMNS].isna().any(axis=1)
    if missing_mask.any():
        warnings.warn(
            "Missing values found in required columns; dropping affected rows.",
            RuntimeWarning,
            stacklevel=2,
        )
        df = df.loc[~missing_mask].reset_index(drop=True)

    if df.empty:
        raise ValueError("No valid rows remain after dropping missing values.")

    return df


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute SMA, RSI, crossover signal, and volatility indicators.

    Args:
        df: DataFrame containing at least the Close column.

    Returns:
        DataFrame with additional indicator columns.

    Raises:
        ValueError: If the input DataFrame is empty or missing required columns.
    """
    if df is None or df.empty:
        raise ValueError("Input DataFrame is empty.")

    if "Close" not in df.columns:
        raise ValueError("Missing required column: Close")

    result = df.copy()
    close = result["Close"]

    result["SMA_14"] = close.rolling(window=14, min_periods=14).mean()
    result["SMA_50"] = close.rolling(window=50, min_periods=50).mean()
    result["SMA_Crossover"] = (result["SMA_14"] > result["SMA_50"]).astype(int)

    # Wilder's smoothing via rolling mean on gains/losses.
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=14, min_periods=14).mean()
    avg_loss = loss.rolling(window=14, min_periods=14).mean()
    rs = avg_gain / avg_loss
    result["RSI_14"] = 100 - (100 / (1 + rs))

    result["Volatility_14"] = close.rolling(window=14, min_periods=14).std()

    return result
