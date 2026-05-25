from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from engine.generate_synthetic_data import ASSET_CONFIGS, generate_all_assets


def test_generate_all_assets_creates_csvs(tmp_path: Path) -> None:
    output_dir = generate_all_assets(output_dir=tmp_path)

    csv_files = sorted(output_dir.glob("*.csv"))
    assert len(csv_files) == len(ASSET_CONFIGS)

    expected_files = {f"{config.symbol}.csv" for config in ASSET_CONFIGS}
    assert expected_files == {csv.name for csv in csv_files}


def test_generated_csvs_have_expected_shape_and_columns(tmp_path: Path) -> None:
    output_dir = generate_all_assets(output_dir=tmp_path)
    expected_columns = ["Date", "Open", "High", "Low", "Close", "Volume"]

    for config in ASSET_CONFIGS:
        csv_path = output_dir / f"{config.symbol}.csv"
        df = pd.read_csv(csv_path)

        assert df.columns.tolist() == expected_columns
        assert len(df) == 1096
