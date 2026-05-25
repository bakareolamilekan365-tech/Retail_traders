# agent.context.md

## Project Context (Locked Decisions)

### Assets

- **15 total assets:**
  - Cryptocurrencies (5): BTC, ETH, BNB, SOL, ADA
  - Nigerian Stock Exchange (10): DANGCEM, MTNN, AIRTELAFRI, BUACEMENT, GTCO, ZENITHBANK, SEPLAT, FBNH, NB, ACCESSCORP
- **NGX split:** ~75% historically strong (7) / ~25% weaker (3) for realistic ML discrimination.
- **Data:** 3-year historical OHLCV (2022-01-01 to 2024-12-31), pre-downloaded CSVs in `/backend/data/`.
- **CSV columns:** Date, Open, High, Low, Close, Volume.
- **Data sources:** CoinGecko (crypto), Investing.com (NGX). Documented in `DATA_SOURCES.md`.

### Machine Learning

- **Algorithm:** Random Forest Regressor (scikit-learn).
- **Target:** Predict future 7-day return (continuous value).
- **Threshold mapping:** Predicted return > +2% → BUY, < -2% → SELL, else → HOLD.
- **Training:** Offline via `/backend/src/engine/train.py`, saves `model.joblib`.
- **Inference:** Model loaded once at API startup; prediction runs on latest indicator row.

### Backend (FastAPI)

- **Framework:** FastAPI with auto-generated Swagger docs at `/docs`.
- **Database:** SQLite (`backend/data/app.db`). Tables: `users`, `prediction_log`.
- **Auth:** Full registration + login + password change. JWT tokens (HS256, 7-day expiry for demo). Password hashing with bcrypt via passlib.
- **Admin:** Auto-created at startup (username: `admin`, password from `ADMIN_PASSWORD` env var or default `admin123`). Admin can view users, all predictions, and system stats.
- **Demo user:** Auto-created at startup (username: `demo`, password: `demo123`). Seeded with prediction history.
- **Prediction endpoint:** `GET /api/v1/predict?asset=BTC&days=180` (protected). Returns OHLCV, indicators, prediction, insight. Data served from in-memory cache (loaded at startup).
- **Graceful startup:** Skips missing CSVs with a warning; fails cleanly if model file missing.
- **Rate limiting:** slowapi at 5 req/sec.
- **CORS:** Restricted to frontend origin (localhost:5173).
- **Logging:** Console + file (`backend/logs/app.log`).

### Frontend (React + Vite)

- **Charts:** TradingView Lightweight Charts for main price chart (candlestick + SMA overlays).
- **Styling:** Tailwind CSS, responsive design (mobile-first), dark/light mode toggle (localStorage).
- **State:** No Redux, no router — simple `useState` + `useEffect` in `App.jsx` and `Dashboard.jsx`.
- **Auth flow:** JWT stored in sessionStorage. `api.js` wrapper handles 401 auto-logout.
- **Components:** App, LoginForm, RegisterForm, Dashboard, AssetSelector, PriceChart, IndicatorCards, PredictionPanel, InsightBar, PredictionHistory, AdminPanel.
- **Logout:** In user dropdown (top-right), clears token and returns to login.
- **Admin panel:** Visible only if `is_admin` is true. Tabs: Users, Predictions, Stats.
- **Refresh:** Manual refresh button + auto-refresh polling every 5 minutes.
- **Error handling:** Loading skeletons, error boundaries, fallback messages for all edge states.
- **Production build:** FastAPI serves built React files for single-server deployment.

### Insight Sentence Engine

- Rule-based, deterministic. Uses latest indicator values + prediction.
- Clauses: Trend (SMA crossover), Momentum (RSI with bands), Risk (volatility bands), Model recommendation.
- Example: "Short‑term uptrend confirmed by SMA 14 crossing above SMA 50. RSI at 58.2 indicates neutral momentum. Volatility is low (1.8%). Our model recommends a BUY with an expected 7‑day return of +3.2% (confidence 78%)."

### Testing

- **Backend:** Pytest with in-memory SQLite fixtures, mock DataFrames.
- **Frontend:** Vitest (shares Vite config).
- **Coverage:** Normal execution, edge cases (zero volume, flat prices, missing data, file-not-found, auth failures).

### Deployment

- **Development:** Two terminals (uvicorn on :8000, Vite on :5173).
- **Defense:** Single server — `vite build` → FastAPI serves static files + API.
- **Environment variables:** `SECRET_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`.

### Constraints

- $0 budget, no paid APIs, no live data feeds.
- 2-week development timeline.
- No over-engineering: one main endpoint, no router, no global state manager.
- All code must be complete, tested, and ready to demo.
