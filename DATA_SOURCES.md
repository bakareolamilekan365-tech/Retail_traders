# DATA_SOURCES.md

## Data Collection & Provenance

All historical market data used in this project was sourced as static CSV files to ensure offline reproducibility, eliminate network dependencies, and avoid costs. No live APIs or paid services were used.

---

### Cryptocurrency Data (5 assets)

- **Source:** CoinGecko
- **Assets:** BTC, ETH, BNB, SOL, ADA
- **Granularity:** Daily OHLCV (Open, High, Low, Close, Volume)
- **Date Range:** 2022‑01‑01 to 2024‑12‑31
- **Acquisition Method:** Manual CSV export from the CoinGecko website (free tier).
- **Reliability:** CoinGecko is a widely cited, industry‑standard crypto data aggregator used in academic and professional research.

---

### Nigerian Stock Exchange Data (10 assets)

- **Source:** Investing.com (Nigeria section)
- **Assets:** DANGCEM, MTNN, AIRTELAFRI, BUACEMENT, GTCO, ZENITHBANK, SEPLAT, FBNH, NB, ACCESSCORP
- **Granularity:** Daily OHLCV
- **Date Range:** 2022‑01‑01 to 2024‑12‑31
- **Acquisition Method:** Manual historical data download from Investing.com.
- **Reliability:** Investing.com provides verified exchange data and is commonly referenced in financial research and academic studies.

---

### File Storage

- All CSV files are stored in `/backend/data/` with the naming convention `{SYMBOL}.csv`.
- Each file contains the columns: `Date, Open, High, Low, Close, Volume`.
- Data is pre‑validated before use; missing files or malformed rows are handled gracefully by the preprocessing engine.

---

### Why Static CSVs?

- Ensures complete reproducibility — every model run uses identical data.
- Eliminates dependency on external network conditions during development, testing, and defense.
- Allows controlled sandboxing — the exact dataset can be audited and versioned.
