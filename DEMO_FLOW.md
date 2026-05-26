# DEMO_FLOW.md

## Defense Presentation Walkthrough

This script guides you through a live demonstration of the Intelligent Investment Recommendation Assistant.  
Follow these steps in order to showcase every feature without fumbling.

**Total estimated time:** 5–7 minutes.

---

### 0. Pre-Flight Checks (Before the Presentation)

- [ ] Ensure `backend/data/` contains all 15 CSV files.
- [ ] Ensure `model.joblib` exists in `backend/src/engine/`.
- [ ] Start the backend: `uvicorn src.api.main:app --port 8000`.
- [ ] Build and start the frontend (or use single‑server mode).
- [ ] Open a browser to the app.
- [ ] Have a second tab ready with `http://localhost:8000/docs`.

---

### 1. Login Screen

- **Show:** The clean login page with the app title.
- **Action:** Point out the "Register" link below the form.
- **Say:** "The system has full authentication. Let me log in with the pre‑seeded demo account."

### 2. Log In as Demo User

- **Action:** Enter `demo` / `demo123` and click Login.
- **Result:** Dashboard loads with data pre‑populated.
- **Say:** "Notice the dashboard loads instantly with pre‑seeded prediction history, so the application always feels alive."

### 3. Dashboard Overview

- **Point to:**
  - Asset Selector dropdown (top left).
  - Price Chart (center, TradingView).
  - Indicator Cards (RSI, Volatility, Crossover).
  - Prediction Panel (BUY/SELL/HOLD badge).
  - Insight Bar (bottom text).
- **Say:** "The dashboard gives a complete trading snapshot — from chart to AI prediction — in a single view."

### 4. Switch Assets

- **Action:** Use the dropdown to change from BTC to DANGCEM (or any other).
- **Result:** Chart and all cards update.
- **Say:** "The system supports 15 assets — 5 crypto and 10 Nigerian stocks — all switching in real time."

### 5. Explain the Chart

- **Point to:** Candlestick bars and SMA 14/50 lines.
- **Action:** Use the Replay button to step through the historical candles, then stop to return to the full chart.
- **Say:** "We use TradingView Lightweight Charts for professional‑grade financial visualization, and the replay control walks through past candles at a fixed pace."

### 6. Explain the Indicators

- **Point to:** Each card — RSI, Volatility, Crossover.
- **Say:** "The backend calculates three classic technical indicators — SMA Crossover, RSI, and Volatility — from 3 years of historical data."

### 7. Explain the Prediction Panel

- **Point to:** The signal badge, expected return, confidence.
- **Say:** "A Random Forest Regressor predicts the next 7‑day return and maps it to a BUY, SELL, or HOLD signal. Here, it says BUY with a 3.2% expected return and 78% confidence."

### 8. Open the Simulator

- **Action:** Click the Simulator tab.
- **Result:** The what-if panel appears with the latest prediction summary.
- **Action:** Enter a Naira amount and review the estimated units, expected 7-day value, and gain/loss.
- **Say:** "This is a simulated estimate based on the AI model's prediction. It is not financial advice."

### 9. Explain the Insight Sentence

- **Read:** The insight text aloud.
- **Say:** "This is generated entirely by our rule‑based engine — no AI or NLP, just deterministic logic that turns numbers into plain English for the retail trader."

### 10. Manual Refresh

- **Action:** Click the Refresh button.
- **Result:** Loading spinner appears briefly, data reloads.
- **Say:** "Users can manually refresh at any time. An auto-refresh also runs every 5 minutes."

### 11. Theme Handling

- **Action:** Point out that the product is locked to the dark trading-terminal look for the defense build.
- **Say:** "The current demo keeps a consistent dark trading-terminal presentation for readability and brand consistency."

### 12. Prediction History

- **Scroll to / point to:** The prediction history table (if implemented).
- **Say:** "Every prediction is logged to the database, giving users a history of signals for each asset."

### 13. Logout

- **Action:** Click the user area (top right), then Logout.
- **Result:** Returns to login screen.
- **Say:** "Logout clears the session securely."

### 14. Register a New Account

- **Action:** Click "Register", fill in a new username/email/password, submit.
- **Result:** Success message, then log in with new credentials.
- **Say:** "The system supports full self‑registration with bcrypt‑hashed passwords."

### 15. Change Password

- **Action:** Log in as the new user, go to user dropdown, select Change Password.
- **Result:** Change password form, update, logout, log in with new password.
- **Say:** "Users can change their password at any time."

### 16. Admin Panel

- **Action:** Log out, log in as `admin`.
- **Result:** Dashboard appears, and an "Admin" link is visible in the user dropdown.
- **Action:** Click Admin.
- **Show:** Users tab (list of registered users), Predictions tab (filterable log), Stats tab (aggregate counts).
- **Say:** "Admin users have a dedicated monitoring panel to view all registered users, all predictions, and system usage stats — demonstrating role‑based access control."

### 17. API Documentation

- **Action:** Switch to the browser tab with `http://localhost:8000/docs`.
- **Show:** The auto‑generated Swagger UI.
- **Say:** "FastAPI automatically generates interactive API documentation. Every endpoint is listed with its schema, and you can test them right here in the browser."

### 18. Wrap Up

- **Say:** "This system was built in under two weeks for $0, using only free and open‑source tools. It demonstrates a complete full‑stack machine learning pipeline, production‑grade engineering practices, and a real‑world use case for retail traders."

---

### If Time Permits

- Show the `README.md` and project structure in VS Code.
- Show a passing test run in the terminal (`pytest -v` and `npm test`).
- Show the CSV files in `backend/data/` to prove the offline data source.
- Mention the environment variable configuration for secrets.
