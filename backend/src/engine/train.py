"""Model training pipeline for the Random Forest return predictor."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List, Tuple

import pandas as pd
from joblib import dump
from sklearn.ensemble import RandomForestRegressor

BACKEND_SRC = Path(__file__).resolve().parents[1]
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from engine.preprocessing import compute_indicators, load_and_preprocess

INDICATOR_COLUMNS: List[str] = [
    "SMA_14",
    "SMA_50",
    "SMA_Crossover",
    "RSI_14",
    "Volatility_14",
]


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create feature matrix with lagged returns and rolling statistics.

    Args:
        df: DataFrame containing OHLCV data and optional indicator columns.

    Returns:
        DataFrame containing model features aligned to the input index.

    Raises:
        ValueError: If the input DataFrame is empty or missing required columns.
    """
    if df is None or df.empty:
        raise ValueError("Input DataFrame is empty.")

    required_columns = {"Close", "Volume"}
    missing_columns = required_columns.difference(df.columns)
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing_columns))}")

    data = df.copy()
    if not set(INDICATOR_COLUMNS).issubset(data.columns):
        data = compute_indicators(data)

    close = data["Close"]
    returns = close.pct_change()

    features = pd.DataFrame(index=data.index)
    features["Close"] = close
    features["Volume"] = data["Volume"]
    features["SMA_14"] = data["SMA_14"]
    features["SMA_50"] = data["SMA_50"]
    features["SMA_Crossover"] = data["SMA_Crossover"]
    features["RSI_14"] = data["RSI_14"]
    features["Volatility_14"] = data["Volatility_14"]
    features["Return_1d"] = returns
    features["Lag_Return_1"] = returns.shift(1)
    features["Lag_Return_2"] = returns.shift(2)
    features["Lag_Return_3"] = returns.shift(3)
    features["Rolling_Return_Mean_7"] = returns.rolling(window=7, min_periods=7).mean()
    features["Rolling_Return_Std_7"] = returns.rolling(window=7, min_periods=7).std()

    return features


def create_labels(df: pd.DataFrame, forward_days: int = 7) -> pd.Series:
    """Create future return labels for supervised learning.

    Args:
        df: DataFrame containing OHLCV data with a Close column.
        forward_days: Number of days ahead to compute future return.

    Returns:
        Series of future returns (percentage change).

    Raises:
        ValueError: If input DataFrame is empty or forward_days is invalid.
    """
    if df is None or df.empty:
        raise ValueError("Input DataFrame is empty.")

    if forward_days <= 0:
        raise ValueError("forward_days must be a positive integer.")

    if "Close" not in df.columns:
        raise ValueError("Missing required column: Close")

    future_close = df["Close"].shift(-forward_days)
    labels = (future_close - df["Close"]) / df["Close"]
    labels.name = f"Return_{forward_days}d"
    return labels


def _load_training_data(data_dir: Path, forward_days: int) -> Tuple[pd.DataFrame, pd.Series]:
    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        raise ValueError(f"No CSV files found in {data_dir}.")

    feature_frames: List[pd.DataFrame] = []
    label_frames: List[pd.Series] = []

    for csv_path in csv_files:
        try:
            raw = load_and_preprocess(str(csv_path))
        except (FileNotFoundError, ValueError, pd.errors.ParserError) as exc:
            raise ValueError(f"Failed to load {csv_path.name}: {exc}") from exc

        try:
            enriched = compute_indicators(raw)
            features = prepare_features(enriched)
            labels = create_labels(enriched, forward_days=forward_days)
        except ValueError as exc:
            raise ValueError(f"Failed to compute features for {csv_path.name}: {exc}") from exc

        combined = features.join(labels)
        combined = combined.dropna()
        if combined.empty:
            raise ValueError(f"Not enough valid rows after feature/label alignment for {csv_path.name}.")

        feature_frames.append(combined.drop(columns=[labels.name]))
        label_frames.append(combined[labels.name])

    feature_matrix = pd.concat(feature_frames, ignore_index=True)
    label_vector = pd.concat(label_frames, ignore_index=True)

    if feature_matrix.empty or label_vector.empty:
        raise ValueError("Training data is empty after aggregation.")

    return feature_matrix, label_vector


def train_model(data_dir: str, model_path: str, forward_days: int = 7) -> RandomForestRegressor:
    """Train a Random Forest model and save it to disk.

    Args:
        data_dir: Directory containing OHLCV CSV files.
        model_path: Output path for the saved model.joblib.
        forward_days: Number of days ahead to compute future return labels.

    Returns:
        Trained RandomForestRegressor instance.

    Raises:
        FileNotFoundError: If the data directory does not exist.
        ValueError: If training data cannot be prepared or model training fails.
        OSError: If the model cannot be saved.
    """
    if not isinstance(data_dir, str) or not data_dir.strip():
        raise ValueError("data_dir must be a non-empty string.")
    if not isinstance(model_path, str) or not model_path.strip():
        raise ValueError("model_path must be a non-empty string.")

    data_path = Path(data_dir).expanduser().resolve()
    if not data_path.exists() or not data_path.is_dir():
        raise FileNotFoundError(f"Training data directory not found: {data_path}")

    features, labels = _load_training_data(data_path, forward_days)

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    try:
        model.fit(features, labels)
    except ValueError as exc:
        raise ValueError(f"Model training failed: {exc}") from exc

    output_path = Path(model_path).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        dump(model, output_path)
    except OSError as exc:
        raise OSError(f"Failed to save model to {output_path}") from exc

    return model


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train the Random Forest return predictor.")
    parser.add_argument(
        "--data-dir",
        required=True,
        help="Directory containing OHLCV CSV files.",
    )
    parser.add_argument(
        "--model-path",
        required=True,
        help="Output path for model.joblib.",
    )
    parser.add_argument(
        "--forward-days",
        type=int,
        default=7,
        help="Number of days ahead to compute future return labels.",
    )
    args = parser.parse_args()

    train_model(args.data_dir, args.model_path, forward_days=args.forward_days)
    print(f"Model saved to {args.model_path}")
