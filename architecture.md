# System Architecture

## 1. Overview

The **Intelligent Investment Recommendation Assistant** is a decoupled, full‑stack application designed for retail traders.  
It automates technical analysis and generates **Buy / Sell / Hold** signals using a Random Forest Regressor trained on historical market data.

The system is split into two isolated layers:

- **Backend** – Python (FastAPI) responsible for data processing, indicator computation, model inference, authentication, and API delivery.
- **Frontend** – React (Vite) responsible for rendering the dashboard, charts, and user interactions.

All data is sourced from static CSV files stored locally — no live APIs, no cloud costs.

---

## 2. High‑Level Architecture Diagram (Text Description)

[ Browser / User ]
|
| HTTPS (local dev: HTTP)
v
[ Frontend : React + Vite + Tailwind ]

Login / Register

Dashboard (Asset Selector, TradingView Chart, Indicator Cards, Prediction Panel, Insight)

Admin Panel (Users, Predictions, Stats)
|
| REST API (JSON) + JWT Bearer Token
v
[ Backend : FastAPI ]

Auth routes (/auth/register, /auth/login, /auth/change-password)

Protected routes (/assets, /predict)

Admin routes (/admin/users, /admin/predictions, /admin/stats)

Auto‑generated Swagger docs at /docs
|
| Internal calls
v
[ Engine Layer ]

preprocessing.py : CSV loading, SMA, RSI, Volatility calculation

train.py : offline model training → saves joblib

predict_service.py: loads model, predicts future 7‑day return, applies thresholds
|
| Reads / Writes
v
[ Data Layer ]

/backend/data/\*.csv : 15 assets × 3 years of OHLCV

/backend/data/app.db : SQLite (users, prediction_log)

text

---

## 3. Component Descriptions

### 3.1 Backend (`/backend`)

| Module                          | Responsibility                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/engine/preprocessing.py`   | Ingests CSV, computes SMA 14/50, SMA Crossover signal, RSI 14, Volatility 14. Caches results in memory at startup.                                           |
| `src/engine/train.py`           | Offline training script: loads all CSVs, engineers features, trains a RandomForestRegressor to predict 7‑day forward returns, saves model as `model.joblib`. |
| `src/engine/predict_service.py` | Loads the trained model and cached indicators. For a given asset, runs prediction and maps the predicted return to BUY/SELL/HOLD using thresholds (±2%).     |
| `src/api/main.py`               | FastAPI application entry point. Registers routers, configures CORS, rate limiting, startup event for data loading and admin/demo user seeding.              |
| `src/api/auth.py`               | Auth endpoints: register, login (returns JWT), change-password. Uses bcrypt hashing via passlib.                                                             |
| `src/api/assets.py`             | Returns list of available assets (symbol, name, type).                                                                                                       |
| `src/api/predict.py`            | Protected endpoint: `GET /predict?asset=BTC&days=180`. Returns OHLCV, indicators, prediction, and insight.                                                   |
| `src/api/admin.py`              | Admin‑only endpoints: list users, list predictions (filterable), system stats.                                                                               |
| `tests/`                        | Pytest suite with in‑memory SQLite, mock DataFrames, test coverage for all engine and API modules.                                                           |

### 3.2 Frontend (`/frontend`)

| Component               | Responsibility                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `App.jsx`               | Root component. Checks JWT existence. Renders Login/Register or Dashboard.                                                   |
| `LoginForm.jsx`         | Username + password form. Calls `/auth/login`, stores token in sessionStorage.                                               |
| `RegisterForm.jsx`      | Registration form (username, email, password). Calls `/auth/register`.                                                       |
| `Dashboard.jsx`         | Main container after login. Manages selected asset, fetches data from `/predict` and `/assets`. Contains all sub‑components. |
| `AssetSelector.jsx`     | Dropdown to switch among 15 assets. Triggers data reload.                                                                    |
| `PriceChart.jsx`        | Renders candlestick chart with SMA 14/50 overlays using TradingView Lightweight Charts.                                      |
| `IndicatorCards.jsx`    | Displays RSI, Volatility, and Crossover signal in styled cards.                                                              |
| `PredictionPanel.jsx`   | Shows BUY/SELL/HOLD badge, expected return %, confidence.                                                                    |
| `InsightBar.jsx`        | Renders the auto‑generated plain‑English insight sentence.                                                                   |
| `PredictionHistory.jsx` | (Optional) Table showing recent predictions from `prediction_log`.                                                           |
| `AdminPanel.jsx`        | Visible only for admin users. Tabs: Users, Predictions, Stats.                                                               |
| `utils/api.js`          | Centralised fetch wrapper: attaches JWT, handles 401/network errors.                                                         |
| `utils/formatters.js`   | Date, number, percentage formatting helpers.                                                                                 |

---

## 4. Data Flow (Activity / Sequence Diagram Source)

### 4.1 User Prediction Request Flow

1. User opens the app → `App.jsx` detects no JWT → shows `LoginForm`.
2. User logs in (or registers) → JWT stored in sessionStorage → Dashboard mounts.
3. Dashboard calls `GET /assets` to populate dropdown, then `GET /predict?asset=BTC&days=180` for default asset.
4. Backend:
   - Validates JWT.
   - Retrieves cached OHLCV + indicators for the asset (last 180 days).
   - Runs the pre‑loaded Random Forest model on the latest row of indicators.
   - Maps predicted return to signal, generates insight sentence.
   - Logs prediction to `prediction_log`.
   - Returns JSON response.
5. Frontend updates `PriceChart`, `IndicatorCards`, `PredictionPanel`, `InsightBar`.
6. Manual refresh button or auto‑refresh (5‑minute interval) repeats step 3‑5.

### 4.2 Admin Flow

1. Admin user logs in (auto‑created at startup).
2. Dashboard shows an extra “Admin” link in the user dropdown.
3. Clicking “Admin” opens `AdminPanel` with three tabs:
   - **Users** – table of registered users (fetched from `GET /admin/users`).
   - **Predictions** – filterable log of all predictions (`GET /admin/predictions`).
   - **Stats** – aggregate counts, most active user, most requested asset.

---

## 5. Database & File Structure

### 5.1 CSV Input Files

- Location: `/backend/data/`
- Naming: `{SYMBOL}.csv` (e.g., `BTC.csv`, `DANGCEM.csv`)
- Columns: `Date, Open, High, Low, Close, Volume`
- Date format: `YYYY-MM-DD`
- All numeric columns: float (except Date)

### 5.2 SQLite Database (`app.db`)

**Table: `users`**

| Column          | Type      | Constraints               |
| --------------- | --------- | ------------------------- |
| id              | INTEGER   | PRIMARY KEY AUTOINCREMENT |
| username        | TEXT      | UNIQUE NOT NULL           |
| email           | TEXT      | UNIQUE NOT NULL           |
| hashed_password | TEXT      | NOT NULL                  |
| is_admin        | BOOLEAN   | DEFAULT FALSE             |
| created_at      | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Table: `prediction_log`**

| Column          | Type      | Constraints               |
| --------------- | --------- | ------------------------- |
| id              | INTEGER   | PRIMARY KEY AUTOINCREMENT |
| user_id         | INTEGER   | FOREIGN KEY → users.id    |
| asset           | TEXT      | NOT NULL                  |
| signal          | TEXT      | NOT NULL (BUY/SELL/HOLD)  |
| expected_return | REAL      | NOT NULL                  |
| confidence      | REAL      | NOT NULL                  |
| timestamp       | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 6. API Contract (Summary)

### 6.1 Authentication Endpoints

| Method | Path                           | Auth | Description        |
| ------ | ------------------------------ | ---- | ------------------ |
| POST   | `/api/v1/auth/register`        | No   | Create account     |
| POST   | `/api/v1/auth/login`           | No   | Login, returns JWT |
| POST   | `/api/v1/auth/change-password` | Yes  | Change password    |

### 6.2 Core Endpoints (Protected)

| Method | Path                                 | Description                                |
| ------ | ------------------------------------ | ------------------------------------------ |
| GET    | `/api/v1/assets`                     | List all available assets                  |
| GET    | `/api/v1/predict?asset=BTC&days=180` | Get OHLCV, indicators, prediction, insight |

### 6.3 Admin Endpoints (Admin role required)

| Method | Path                                        | Description               |
| ------ | ------------------------------------------- | ------------------------- |
| GET    | `/api/v1/admin/users`                       | List all registered users |
| GET    | `/api/v1/admin/predictions?user_id=&asset=` | Query prediction history  |
| GET    | `/api/v1/admin/stats`                       | System usage statistics   |

### 6.4 JSON Response Example (`/predict`)

```json
{
	"asset": "BTC",
	"timestamp": "2026-05-25T12:00:00Z",
	"ohlcv": { ... },
	"indicators": { ... },
	"prediction": {
		"signal": "BUY",
		"expected_return_7d": 3.2,
		"confidence": 0.78
	},
	"insight": "Short‑term uptrend confirmed by SMA 14 crossing above SMA 50. RSI at 58.2 indicates neutral momentum. ..."
}
```

### 7. Technology Stack

Layer Technology
Backend framework FastAPI (Python 3.10+)
Data processing Pandas, NumPy
Machine learning Scikit‑learn (RandomForestRegressor)
Database SQLite (via sqlite3 module)
Auth JWT (pyjwt / python‑jose), bcrypt (passlib)
Rate limiting slowapi
Frontend framework React 18+ with Vite
Styling Tailwind CSS
Charts TradingView Lightweight Charts
Testing (backend) Pytest
Testing (frontend) Vitest

### 8. Deployment & Running the System

Development Mode
Backend: uvicorn main:app --reload (port 8000)

Frontend: npm run dev (port 5173)

Production / Defense Mode (Single Server)
Build frontend: npm run build → output in frontend/dist/

FastAPI serves the static files from that directory.

Single command: uvicorn main:app (serves both API and UI on one port).

Environment Variables
Variable Description Default (dev)
SECRET_KEY JWT signing key dev-secret-key
ADMIN_PASSWORD Password for auto‑created admin admin123
DATABASE_URL SQLite path sqlite:///./backend/data/app.db

### 9. Security Considerations

Passwords hashed with bcrypt (12 rounds).

JWT tokens expire after 7 days (demo convenience; noted for production adjustment).

CORS restricted to frontend origin.

Rate limiting (5 req/sec per client) prevents brute force.

Input validation via Pydantic models.

Admin endpoints protected by role check.

Generic error messages prevent user enumeration.

### 10. Future Improvements (Technical Debt Notes)

Implement refresh token rotation for JWT.

Add email verification and password reset.

Migrate to PostgreSQL for production multi‑user concurrency.

Containerise with Docker for environment consistency.

Add CI/CD pipeline for automated testing and deployment.
