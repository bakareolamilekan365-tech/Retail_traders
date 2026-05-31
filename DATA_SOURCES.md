# DATA_SOURCES.md

## Data Collection & Provenance

The dataset is a static snapshot built from real market downloads where available, with synthetic fallback CSVs only for assets that could not be downloaded reliably. This keeps the demo offline-friendly and stable while still using real data for the assets that support it.

Safety and reproducibility notes:

- By default, the repository disables automatic remote downloads to avoid accidental large network/disk operations during development. To explicitly fetch remote data, run `download_real_data.py` with `FORCE_DOWNLOAD=1` set in the environment.
- Synthetic fallback CSVs are generated deterministically by `generate_synthetic_data.py` and are intended only for demo/offline use — they are clearly labelled in documentation and not presented as live exchange data.
- The audit stopped after measuring storage usage; the biggest local consumers are `backend/venv` and `frontend/node_modules`, not the CSV dataset itself.

---

### Cryptocurrency Data

- **Source:** Real historical market downloads (offline CSV snapshot)
- **Assets:** BTC, ETH, BNB, SOL, ADA, XRP, DOGE, LTC, TRX, DOT
- **Granularity:** Daily OHLCV (Open, High, Low, Close, Volume)
- **Date Range:** 2020‑01‑01 to 2026‑04‑30
- **Date Range:** 2020‑01‑01 to 2026‑04‑30 (backend returns full series; the frontend slices per selected window)
- **Acquisition Method:** Downloaded once and stored locally as CSV files.
- **Note:** These assets are treated as real data in the demo because they were fetched from the source feed and stored locally.

---

### Nigerian Stock Exchange Data

- **Source:** Best-effort historical downloads; fallback synthetic CSVs for unavailable symbols
- **Assets:** DANGCEM, MTNN, AIRTELAFRI, BUACEMENT, GTCO, ZENITHBANK, SEPLAT, FBNH, NB, ACCESSCORP, UBA, STANBIC, FIDELITYBK, FCMB, UCAP, TRANSCORP, OANDO, PRESCO, WAPCO, NESTLE
- **Granularity:** Daily OHLCV
- **Date Range:** 2020‑01‑01 to 2026‑04‑30
- **Acquisition Method:** Downloaded where available; missing tickers are generated as synthetic fallback so the demo still runs.
- **Note:** The demo labels these assets transparently; fallback symbols are not presented as live exchange data.

---

### File Storage

- All CSV files are stored in `/backend/data/` with the naming convention `{SYMBOL}.csv`.
- Each file contains the columns: `Date, Open, High, Low, Close, Volume`.
- Data is pre‑validated before use; missing files or malformed rows are handled gracefully by the preprocessing engine.

### Audit Logs

- Backend activity logs are written to `/backend/logs/app.log` and surfaced in the admin Audit Logs page.
- The log file is capped and rotated to keep the demo lightweight.
- If storage pressure returns, clear old log rotations first; logs are a much smaller issue than the local Python and Node environments.

Operational note:

- The backend is configured to cap and rotate logs to avoid unbounded disk growth. If you observe unexpected disk usage, check `/backend/logs/` and stop any running download/train processes before investigating further.

---

### Why Static CSVs?

- Ensures complete reproducibility — every model run uses identical data.
- Eliminates dependency on external network conditions during development, testing, and defense.
- Allows controlled sandboxing — the exact dataset can be audited and versioned.
