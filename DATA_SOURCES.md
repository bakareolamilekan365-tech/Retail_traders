# DATA_SOURCES.md

## Data Collection & Provenance

The dataset is a static snapshot built from real market downloads where available, with synthetic fallback CSVs only for assets that could not be downloaded reliably. This keeps the demo offline-friendly and stable while still using real data for the assets that support it.

---

### Cryptocurrency Data

- **Source:** Real historical market downloads (offline CSV snapshot)
- **Assets:** BTC, ETH, BNB, SOL, ADA, XRP, DOGE, LTC, TRX, DOT
- **Granularity:** Daily OHLCV (Open, High, Low, Close, Volume)
- **Date Range:** 2020‑01‑01 to 2026‑04‑30
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

---

### Why Static CSVs?

- Ensures complete reproducibility — every model run uses identical data.
- Eliminates dependency on external network conditions during development, testing, and defense.
- Allows controlled sandboxing — the exact dataset can be audited and versioned.
