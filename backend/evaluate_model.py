import sys
from pathlib import Path
import pandas as pd
import numpy as np
from joblib import load
from sklearn.metrics import mean_squared_error, mean_absolute_error, accuracy_score

# Make sure we can import from backend/src
sys.path.append(str(Path(__file__).resolve().parent / "src"))

from engine.train import _load_training_data

def signal_from_return(r):
    if r > 0.02:
        return "BUY"
    elif r < -0.02:
        return "SELL"
    return "HOLD"

def main():
    model_path = Path("model.joblib")
    if not model_path.exists():
        print(f"Model file not found: {model_path}")
        return

    model = load(model_path)
    data_dir = Path("data")
    features, labels = _load_training_data(data_dir, forward_days=7)

    preds = model.predict(features)

    rmse = np.sqrt(mean_squared_error(labels, preds))
    mae = mean_absolute_error(labels, preds)
    actual_signals = labels.apply(signal_from_return)
    pred_signals = pd.Series(preds).apply(signal_from_return)
    acc = accuracy_score(actual_signals, pred_signals)

    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"Accuracy (BUY/SELL/HOLD): {acc:.2%}")

if __name__ == "__main__":
    main()
