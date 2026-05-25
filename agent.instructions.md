# agent.instructions.md

## Project Execution Plan

Step‑by‑step instructions for building the Intelligent Investment Recommendation Assistant.  
Each step must be executed sequentially, with all tests passing before moving on.

---

## Test Layers (Applicable to Every Step)

The agent must write tests at these levels for each module:

- **Unit Tests** – individual functions (indicator math, label creation, auth hashing, form logic, insight rules).
- **Integration Tests** – multiple modules together (API endpoint + database + auth, frontend fetch + rendering).
- **Edge Case & Negative Tests** – missing files, invalid inputs, expired tokens, zero volume, flat prices, network errors.
- **Smoke Tests** – a complete request‑response cycle for each critical endpoint (register → login → predict → logout, admin routes) using FastAPI TestClient or frontend mock.

All tests must pass before the step is considered complete.

---

## Step 1: Backend Data Preprocessing Engine

- **Objective:** Establish the core data processing module that ingests CSV files and computes technical indicators.
- **Tasks:**
  1. Create `/backend/src/engine/preprocessing.py`.
     - Function `load_and_preprocess(filepath: str) -> pd.DataFrame`:
       - Reads CSV, validates required columns (Date, Open, High, Low, Close, Volume).
       - Handles missing file, empty DataFrame, and missing values.
     - Function `compute_indicators(df: pd.DataFrame) -> pd.DataFrame`:
       - Computes SMA 14, SMA 50, SMA Crossover Signal (1 if SMA_14 > SMA_50 else 0), RSI 14 (Wilder’s smoothing via rolling mean), Volatility 14 (rolling std of Close).
       - Returns DataFrame with added columns.
  2. Create `/backend/tests/test_preprocessing.py` with Pytest:
     - Test normal computation against known arrays.
     - Test zero volume rows (should not affect indicator values).
     - Test flat prices (RSI → NaN or neutral; ensure no crash).
     - Test DataFrame with fewer than 50 rows (SMA_50 should be NaN).
     - Test missing Close values (should drop or warn).
     - Mock `pd.read_csv` to test file-not-found handling.
  3. Create `/.gitignore` at project root (ignores: `__pycache__/`, `*.pyc`, `venv/`, `.env`, `app.db`, `model.joblib`, `node_modules/`, `dist/`, IDE files, OS junk, `.pytest_cache/`).
  4. Create `/backend/requirements.txt` with exact dependencies: `fastapi`, `uvicorn[standard]`, `pandas`, `numpy`, `scikit-learn`, `passlib[bcrypt]`, `python-jose[cryptography]`, `slowapi`, `pytest`, `httpx` (for TestClient).
- **Deliverables:** `preprocessing.py`, `test_preprocessing.py`, `.gitignore`, `requirements.txt`. All tests green. Commit & push.

---

## Step 2: Backend Model Training Script

- **Objective:** Build the offline training pipeline that creates the Random Forest model.
- **Tasks:**
  1. Create `/backend/src/engine/train.py`.
     - Function `prepare_features(df: pd.DataFrame) -> pd.DataFrame` – creates lagged features, rolling stats.
     - Function `create_labels(df: pd.DataFrame, forward_days=7) -> pd.Series` – computes future return.
     - Function `train_model(data_dir: str, model_path: str)` – loads all CSVs, preprocesses, trains `RandomForestRegressor`, saves `model.joblib`.
  2. Create `/backend/tests/test_train.py`:
     - Mock a small DataFrame, test feature engineering and label creation.
     - Test model training, saving, and loading.
- **Deliverables:** `train.py`, `test_train.py`, and a generated `model.joblib`. All tests green. Commit & push.

---

## Step 3: Backend API Layer — Core & Prediction Endpoints

- **Objective:** Build the FastAPI application with asset listing and prediction endpoint, integrated with the engine.
- **Tasks:**
  1. Create `/backend/src/api/main.py`:
     - FastAPI app initialization.
     - Startup event: load all CSVs, compute indicators, cache in memory (dict keyed by asset).
     - Load `model.joblib`.
     - Mount routers.
     - CORS middleware, rate limiting (slowapi).
     - Health check endpoint `/health`.
  2. Create `/backend/src/api/assets.py`:
     - Endpoint `GET /api/v1/assets` → returns static list of 15 assets (symbol, name, type).
  3. Create `/backend/src/api/predict.py`:
     - Endpoint `GET /api/v1/predict?asset=BTC&days=180` (protected with JWT).
     - Retrieves cached OHLCV + indicators, runs model on latest row, maps to signal.
     - Generates insight sentence using rule‑based engine.
     - Inserts into `prediction_log`.
     - Returns JSON as per API contract.
  4. Create `/backend/tests/test_api.py`:
     - Test `/assets` returns correct list.
     - Test `/predict` with valid asset returns expected JSON shape.
     - Test `/predict` with invalid asset returns 404.
     - Test `/predict` without auth returns 401.
  - Smoke test: full cycle (login → get token → call predict → receive prediction).
  - **Deliverables:** API endpoints ready, all tests passing. Commit & push.

---

## Step 4: Authentication & Database Layer

- **Objective:** Implement user registration, login, password change, admin seeding, and SQLite database.
- **Tasks:**
  1. Create `/backend/src/api/auth.py`:
     - `POST /api/v1/auth/register` — creates user in `users` table.
     - `POST /api/v1/auth/login` — validates credentials, returns JWT.
     - `POST /api/v1/auth/change-password` — requires old password, updates hash.
  2. Database initialization in `main.py` startup:
     - Create tables if not exist.
     - Seed admin user (from env var) and demo user with `demo`/`demo123`.
     - Seed 10 prediction history rows for demo user.
  3. Password hashing with passlib[bcrypt].
  4. JWT generation and verification utilities.
  5. Create `/backend/tests/test_auth.py`:
     - Register, login, change password flows.
     - Duplicate username/email handling.
     - Token validation and expiry.
  - Smoke test: register → login → change password → login with new password.
  - **Deliverables:** Full auth flow, database seeded, all tests passing. Commit & push.

---

## Step 5: Admin Endpoints

- **Objective:** Role‑based admin monitoring endpoints.
- **Tasks:**
  1. Create `/backend/src/api/admin.py`:
     - `GET /api/v1/admin/users` (admin only) — list all users.
     - `GET /api/v1/admin/predictions?user_id=&asset=` — filterable prediction log.
     - `GET /api/v1/admin/stats` — counts (users, predictions), top asset, most active user.
  2. Admin role check middleware/dependency.
  3. Tests in `test_admin.py`:
     - Normal user accessing admin endpoints gets 403.
     - Admin can retrieve data correctly.
- **Deliverables:** Admin functionality, all tests passing. Commit & push.

---

## Step 6: Frontend Foundation & Auth UI

- **Objective:** Set up the React project with Vite, Tailwind, and implement Login/Register forms.
- **Tasks:**
  1. Initialize frontend with Vite (React template), install Tailwind CSS, TradingView Lightweight Charts, vitest, react‑testing‑library.
  2. Create `utils/api.js` — fetch wrapper with JWT and error handling.
  3. Create `App.jsx` — checks sessionStorage for token, conditionally renders auth or dashboard.
  4. Create `components/LoginForm.jsx` — username/password form, calls `/auth/login`.
  5. Create `components/RegisterForm.jsx` — registration form, calls `/auth/register`.
  6. Create `components/UserMenu.jsx` — user dropdown (change password, logout, admin link if admin).
  7. Create `tests/` with Vitest for components (render, form submission, error states).
- **Deliverables:** Functional auth frontend, all tests passing. Commit & push.

---

## Step 7: Dashboard Core Components

- **Objective:** Build the main dashboard with asset selector, chart, indicators, prediction, and insight.
- **Tasks:**
  1. `Dashboard.jsx` — fetches `/assets` and `/predict`, manages selected asset, renders children.
  2. `AssetSelector.jsx` — dropdown with 15 options.
  3. `PriceChart.jsx` — uses TradingView Lightweight Charts, displays candlestick + SMA overlays.
  4. `IndicatorCards.jsx` — shows RSI, volatility, crossover signal.
  5. `PredictionPanel.jsx` — signal badge, expected return, confidence bar.
  6. `InsightBar.jsx` — displays insight sentence.
  7. Manual refresh button + auto‑refresh interval.
  8. Dark/light mode toggle.
  9. Responsive design with Tailwind.
  10. Write Vitest tests for data rendering, loading states, error fallbacks.
- **Deliverables:** Fully functional dashboard, all tests passing. Commit & push.

---

## Step 8: Admin Panel & Prediction History

- **Objective:** Add admin panel accessible to admin users, and prediction history for all users.
- **Tasks:**
  1. `AdminPanel.jsx` — tabs for Users, Predictions, Stats.
  2. `PredictionHistory.jsx` — table for current user's recent predictions.
  3. Admin link appears in user dropdown only for admin users.
  4. Tests for admin visibility and data fetching.
- **Deliverables:** Admin features, all tests passing. Commit & push.

---

## Step 9: Integration, Production Build & Deployment Prep

- **Objective:** Integrate backend and frontend, configure single‑server deployment, final testing.
- **Tasks:**
  1. In `main.py`, add static file mounting for built frontend (`frontend/dist/`).
  2. Create `scripts/start.sh` for one‑command launch.
  3. Create `requirements.txt` (if not already done in Step 1).
  4. Finalize `README.md` with setup and demo instructions.
  5. Run all backend and frontend tests, ensure coverage.
  6. Ensure all environment variables documented.
- **Deliverables:** Complete, demo‑ready application. Commit & push.

---

## Step 10: Documentation Finalization

- **Objective:** Complete all academic and project documentation.
- **Tasks:**
  1. Finalize `VISION.md`, `DATA_SOURCES.md`, `architecture.md`.
  2. Create `DEMO_FLOW.md` with presentation script.
  3. Review all agent markdown files for consistency.
  4. Prepare any additional academic materials (diagrams, screenshots).
- **Deliverables:** All documentation ready for thesis submission. Commit & push.
