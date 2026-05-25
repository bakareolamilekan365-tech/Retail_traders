# VISION.md

## Intelligent Investment Recommendation Assistant

### 1. Problem Statement

Retail traders in Nigeria and the broader crypto market lack accessible, affordable tools for data‑driven investment decisions.  
They rely on manual technical analysis, emotional trading, and fragmented information sources — leading to slow decisions, missed opportunities, and financial losses.

This project addresses that gap with a **zero‑cost, offline‑capable AI investment recommendation system** built specifically for retail traders.

### 2. Scope

- **15 assets** — 5 major cryptocurrencies (BTC, ETH, BNB, SOL, ADA) + 10 Nigerian Stock Exchange equities (DANGCEM, MTNN, AIRTELAFRI, BUACEMENT, GTCO, ZENITHBANK, SEPLAT, FBNH, NB, ACCESSCORP).
- **3 years of historical data** — OHLCV (Open, High, Low, Close, Volume) from 2022‑01‑01 to 2024‑12‑31, stored locally as CSV files.
- **3 core technical indicators** — SMA Crossover (14‑day vs 50‑day), RSI (14‑day), Market Volatility (14‑day rolling standard deviation).
- **1 machine learning model** — Random Forest Regressor predicting 7‑day future returns, mapped to BUY / SELL / HOLD signals.
- **1 full‑stack dashboard** — React frontend with TradingView charts, indicator cards, prediction panel, insight generation, and admin monitoring panel.

### 3. Target Users

- Retail investors and traders in Nigeria and the crypto space.
- Individuals with basic computer literacy who want clear, AI‑backed trade signals without deep technical analysis knowledge.
- University supervisors evaluating a complete, production‑style final‑year project.

### 4. Core Features

- **Automated Technical Analysis:** SMA, RSI, and volatility computed instantly from historical data.
- **AI‑Powered Predictions:** Random Forest model classifies every asset as BUY, SELL, or HOLD with expected return and confidence score.
- **Intelligent Insights:** Plain‑English commentary generated from indicator values and model output — no AI/NLP, fully deterministic.
- **User Authentication:** Full registration, login, password change, and role‑based access (user / admin).
- **Admin Monitoring:** Admin panel to view registered users, prediction logs, and system usage statistics.
- **Responsive Dashboard:** Works on desktop and mobile, with dark/light mode toggle.
- **Offline & Free:** No live APIs, no paid services, no cloud costs — runs entirely on local machine.

### 5. Technology Highlights

- **Backend:** Python 3.10+, FastAPI, Pandas, NumPy, Scikit‑learn, SQLite, JWT authentication, bcrypt password hashing.
- **Frontend:** React 18+ (Vite), TradingView Lightweight Charts, Tailwind CSS, Vitest.
- **Testing:** Pytest (backend), Vitest (frontend) — test‑driven development throughout.
- **Deployment:** Single‑command launch (FastAPI serves built React app).

### 6. Success Criteria (Defense Readiness)

- All technical indicators are correctly computed and visually validated on charts.
- The Random Forest model produces explainable predictions with measurable accuracy.
- The dashboard is intuitive, responsive, and visually professional.
- The full authentication and admin monitoring flow works end‑to‑end.
- All tests pass (backend + frontend).
- Documentation is complete (architecture, data sources, README, demo flow).
- The system can be launched with a single command and demonstrated live.

### 7. Constraints

- **Budget:** $0 — no paid APIs, no cloud services.
- **Timeline:** 2 weeks from start to defense.
- **Data:** Static CSV files only; no live streaming or external feeds.
- **Over‑engineering avoided:** Single API endpoint for predictions, no router, no global state manager, minimal dependencies.

### 8. What This Project Demonstrates

- End‑to‑end full‑stack development skills.
- Applied machine learning pipeline (data preprocessing, feature engineering, model training, inference).
- Production‑grade software engineering (testing, security, error handling, documentation).
- Academic research methodology (data collection, system analysis, design, implementation, evaluation).
