# Intelligent Investment Recommendation Assistant

TradeSense NG is the visible product name. This repository contains the formal academic project and demo build for the Intelligent Investment Recommendation Assistant.

## Current State

The app is demo-ready. The backend serves historical OHLCV from local CSV files, the frontend slices the returned series for the selected window, and the admin shell includes Audit Logs with search/filter. The dataset on disk spans `2020-01-01` to `2026-04-30`.

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Backend  | FastAPI, Pandas, NumPy, scikit-learn, SQLite     |
| Auth     | JWT (HS256), bcrypt                              |
| Frontend | React 19, Vite, Tailwind CSS, Lightweight Charts |
| Testing  | Pytest, Vitest                                   |

## Project Structure

- `backend/` FastAPI service, engine, tests, local SQLite database
- `frontend/` React dashboard, components, tests
- `scripts/start.sh` one-command defense-mode launcher
- `DATA_SOURCES.md` data provenance and safety notes
- `DEMO_FLOW.md` presentation walkthrough
- `architecture.md` system architecture
- `PHASE_10.md` current documentation / ops status

## Environment Variables

- `SECRET_KEY` JWT signing secret
- `ADMIN_PASSWORD` admin password at startup, default `admin123`
- `DATABASE_URL` SQLite path, default `sqlite:///./backend/data/app.db`
- `MODEL_PATH` optional model override, default `backend/model.joblib`
- `FRONTEND_ORIGIN` frontend origin for CORS in development
- `SERVE_FRONTEND` set to `0` to disable FastAPI static serving of `frontend/dist`
- `FORCE_DOWNLOAD` set to `1` to allow `download_real_data.py` to fetch remote data
- `RF_N_JOBS` controls CPU parallelism for model training, default `1`

## Development Setup

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Backend docs: http://localhost:8000/docs

## Demo / Defense Mode

Build the frontend:

```bash
cd frontend
npm run build
```

Start the single-server app:

```bash
sh scripts/start.sh
```

Open http://localhost:8000.

If `frontend/dist/` exists, FastAPI serves it automatically.

## Demo Accounts

| Role      | Username | Password                       |
| --------- | -------- | ------------------------------ |
| Admin     | `admin`  | `ADMIN_PASSWORD` or `admin123` |
| Demo user | `demo`   | `demo123`                      |

The demo user is seeded with prediction history. The dataset is a mixed snapshot: real downloaded market data is used where available, and synthetic fallback CSVs fill the remaining gaps so the demo stays stable offline.

## Safety Notes

- Network downloads are disabled by default to avoid accidental long-running operations. Set `FORCE_DOWNLOAD=1` only when you intentionally want to fetch remote data.
- Model training defaults to single-threaded (`RF_N_JOBS=1`) so it does not saturate the machine by default.
- If the backend appears to consume excessive CPU or disk, stop the process first and check for running `python`, `uvicorn`, or local training jobs before relaunching.

## Testing

Backend:

```bash
cd backend
pytest -v
```

Frontend:

```bash
cd frontend
npx vitest run
```

## Key API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/assets`
- `GET /api/v1/predict?asset=BTC&days=180`
- `GET /api/v1/predictions/history`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/predictions`
- `GET /api/v1/admin/stats`
- `GET /admin/logs` and the in-app Audit Logs page in the admin shell

## Notes on Current UI and Data Behaviour

- The backend returns the full historical series for assets; the frontend slices the series for the selected chart window.
- Crypto assets use TradingView-style charting for the main price view.
- A left-hand `Sidebar` on desktop and a mobile drawer now match the submitted dashboard layout.
- Admins can view rotated and capped backend logs via the Audit Logs page (`/admin/logs`).

## Audit Stop Point

The repo audit was paused after checking the main storage consumers. The largest local directories are `backend/venv` and `frontend/node_modules`, which are expected development artifacts and the main source of disk usage in this workspace.

## Demo Notes

- The dashboard uses historical offline data only.
- The Replay control steps through historical candles at about 500ms per candle.
- The Simulator tab is a what-if estimate, not paper trading or brokerage execution.
- Non-API frontend routes fall back to the SPA entrypoint so admin pages like `/admin/logs` open directly.
- The application is intended for academic demonstration and decision support only, not financial advice.
