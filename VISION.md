# VISION.md

## Intelligent Investment Recommendation Assistant

### 1. Problem Statement

Retail traders in Nigeria and the broader crypto market need accessible, low-cost tools for data-driven investment decisions. This project addresses that gap with a zero-cost, offline-capable AI recommendation system built for demonstration and academic submission.

### 2. Scope

- 15 assets total: 5 cryptocurrencies and 10 Nigerian market equities.
- Local historical OHLCV data stored as CSV files, spanning `2020-01-01` to `2026-04-30` in the current workspace.
- Three core indicators: SMA crossover, RSI, and volatility.
- One Random Forest model that predicts 7-day future return and maps it to BUY / SELL / HOLD.
- One full-stack dashboard with TradingView-style charts, indicator cards, prediction panel, sidebar navigation, and admin monitoring.

### 3. Target Users

- Retail investors and traders in Nigeria and the crypto space.
- Students and supervisors evaluating a complete final-year project.
- Users who want clear, AI-backed signals without deep technical analysis.

### 4. Core Features

- Automated technical analysis from historical data.
- Deterministic insight generation from indicator values and model output.
- Full authentication: register, login, change password, role-based admin access.
- Admin monitoring with users, prediction logs, and audit logs.
- Responsive dashboard with dark trading-terminal styling and mobile drawer support.
- Offline operation with no live API dependency by default.

### 5. Technology Highlights

- Backend: FastAPI, Pandas, NumPy, scikit-learn, SQLite, JWT, bcrypt.
- Frontend: React 18+ / 19, Vite, Tailwind CSS, TradingView Lightweight Charts, Vitest.
- Testing: Pytest for backend, Vitest for frontend.
- Deployment: single-server mode supported when the frontend is built.

### 6. Success Criteria

- Indicators render correctly and match the data.
- Predictions are explainable and stable across assets.
- The dashboard is responsive and visually consistent.
- Auth and admin flows work end to end.
- Tests pass and the documentation matches the current build.

### 7. Constraints

- Budget: $0.
- No live market feed in the default demo path.
- Avoid over-engineering; keep the prediction path simple and auditable.

### 8. What This Project Demonstrates

- End-to-end full-stack development.
- Applied machine learning workflow.
- Production-minded engineering: testing, security, documentation, and operational safety.
