# Intelligent Investment Recommendation Assistant

A full‑stack AI investment recommendation system for retail traders.  
Built with FastAPI, React, and a Random Forest model — for a university final‑year defense.

---

## Tech Stack

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Backend  | Python 3.10+, FastAPI, Pandas, Scikit‑learn                    |
| Database | SQLite                                                         |
| Auth     | JWT (HS256), bcrypt                                            |
| Frontend | React 18+ (Vite), Tailwind CSS, TradingView Lightweight Charts |
| Testing  | Pytest (backend), Vitest (frontend)                            |

---

## Project Structure

├── backend/
│ ├── data/ # CSVs + app.db
│ ├── src/
│ │ ├── engine/ # preprocessing, training, prediction service
│ │ └── api/ # FastAPI routes (auth, assets, predict, admin)
│ └── tests/ # Pytest suite
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ └── utils/ # API wrapper, formatters
│ └── tests/ # Vitest suite
├── architecture.md # System architecture document
├── VISION.md # Project north star
├── DATA_SOURCES.md # Data provenance
├── DEMO_FLOW.md # Defense walkthrough
└── README.md # This file

text

---

## Quick Start (Development)

### 1. Clone and navigate to the project

```bash
cd intelligent-investment-assistant
2. Backend setup
bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
3. Set environment variables
Create a .env file or export manually:

bash
export SECRET_KEY=your-secret-key
export ADMIN_PASSWORD=your-admin-password
export DATABASE_URL=sqlite:///./backend/data/app.db
4. Prepare data and train the model
Place your CSV files in backend/data/ (see DATA_SOURCES.md).
Train the model:

bash
python src/engine/train.py
5. Start backend (development)
bash
uvicorn src.api.main:app --reload --port 8000
FastAPI docs available at http://localhost:8000/docs.

6. Frontend setup
Open a second terminal:

bash
cd frontend
npm install
npm run dev
Dashboard available at http://localhost:5173.
```

Quick Start (Single Command — Defense Mode)
Build the frontend:

```bash
cd frontend && npm run build
```

Start the backend (serves both API and frontend):

```bash
cd backend
uvicorn src.api.main:app --port 8000
```

Open http://localhost:8000.

Demo Accounts
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Set via ADMIN_PASSWORD env var (default: admin123) |
| User | demo | demo123 |

The demo user has pre‑seeded prediction history.

Running Tests
Backend (Pytest):

```bash
cd backend
pytest -v
```

Frontend (Vitest):

```bash
cd frontend
npm test
```

API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Register a new user |
| POST | /api/v1/auth/login | No | Login, receive JWT |
| POST | /api/v1/auth/change-password | Yes | Change password |
| GET | /api/v1/assets | Yes | List all 15 assets |
| GET | /api/v1/predict?asset=BTC&days=180 | Yes | Get OHLCV, indicators, prediction, insight |
| GET | /api/v1/admin/users | Admin | List all registered users |
| GET | /api/v1/admin/predictions | Admin | View prediction log |
| GET | /api/v1/admin/stats | Admin | System usage statistics |

Full interactive docs at http://localhost:8000/docs.

License
This project is built for academic purposes as a university final‑year project.
