# Intelligent Investment Recommendation Assistant

TradeSense NG is the visible product name. This repository contains the formal academic project: Intelligent Investment Recommendation Assistant.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | FastAPI, Pandas, NumPy, scikit-learn, SQLite |
| Auth | JWT (HS256), bcrypt |
| Frontend | React 19, Vite, Tailwind CSS, Lightweight Charts |
| Testing | Pytest, Vitest |

## Project Structure

- `backend/` FastAPI service, engine, tests, local SQLite database
- `frontend/` React dashboard, components, tests
- `scripts/start.sh` one-command defense-mode launcher
- `DATA_SOURCES.md` data provenance
- `DEMO_FLOW.md` presentation walkthrough
- `architecture.md` system architecture

## Environment Variables

- `SECRET_KEY` JWT signing secret
- `ADMIN_PASSWORD` admin password at startup, default `admin123`
- `DATABASE_URL` SQLite path, default `sqlite:///./backend/data/app.db`
- `MODEL_PATH` optional model override, default `backend/model.joblib`
- `FRONTEND_ORIGIN` frontend origin for CORS in development
- `SERVE_FRONTEND` set to `0` to disable FastAPI static serving of `frontend/dist`

## Development Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Backend docs: http://localhost:8000/docs

## Defense Mode

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

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `ADMIN_PASSWORD` or `admin123` |
| Demo user | `demo` | `demo123` |

The demo user is seeded with prediction history.

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

## Demo Notes

- The dashboard uses historical offline data only.
- The Replay control steps through historical candles at about 500ms per candle.
- The Simulator tab is a what-if estimate, not paper trading or brokerage execution.
- The application is intended for academic demonstration and decision support only, not financial advice.
