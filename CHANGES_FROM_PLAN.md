# Changes from Initial Design — TradeSense NG

## 1) Overall Summary

The project preserved its core architectural intent: a decoupled two-layer system (FastAPI backend + React frontend), offline-first CSV-based market data processing, deterministic indicator generation, and a Random Forest-based BUY/SELL/HOLD recommendation pipeline. Authentication, role-based admin access, and thesis/demo-oriented documentation also remained central.

Major evolution occurred in scale, product packaging, and operational polish. The repository moved from an initial Step-1 backend preprocessing baseline to a complete full-stack product with extensive API surface, dashboard modules, admin tooling, tests, deployment assets, and formalized runbooks. Branding was clarified as **TradeSense NG** at the product layer while retaining the formal academic project title. The dataset expanded from the originally planned 2022–2024 horizon to a current on-disk horizon ending at 2026-04-30. The frontend evolved substantially (landing experience, TradingView embedding, simulator, quick guide, responsive shell, sidebar/drawer behavior, theme controls), and the admin experience now includes audit logs and destructive controls protected by confirmation flows.

## 2) Chronological Development Timeline

### Phase 0 — Initial Baseline
- **009d740 (2026-05-25):** Step 1: Backend Data Preprocessing Engine – all tests passing

### Phase 1 — Core Backend and API Build-out
- **59084da (2026-05-25):** Remove private agent prompts
- **ba9bb79 (2026-05-25):** Add synthetic data generator and training pipeline
- **cc4bb09 (2026-05-25):** Clean up synthetic generator imports
- **3fa1e00 (2026-05-25):** Refactor code structure for improved readability and maintainability
- **df2da8a (2026-05-25):** Step 2: Model training script – all 10 tests passing
- **12c5a1d (2026-05-25):** Add core API endpoints
- **4a9ce13 (2026-05-25):** Step 4: Implement authentication and database layer
- **baa3a0c (2026-05-25):** Update requirements and add application log file
- **ea01610 (2026-05-25):** Step 5: Add admin endpoints and tests

### Phase 2 — Frontend Construction and Dashboard Maturation
- **463d7e2 (2026-05-25):** Step 6: Initialize frontend auth UI
- **57efd36 (2026-05-25):** Step 7: Build dashboard core components
- **5396d70 (2026-05-25):** Add components and tests for PredictionHistory, AssetSelector, IndicatorCards, InsightBar, PredictionPanel, and PriceChart
- **2ded097 (2026-05-25):** Add application log entries for user and prediction events
- **b8faaa5 (2026-05-25):** Fix PriceChart to use lightweight-charts v5 API
- **4292adc (2026-05-25):** WIP: Step 7 UI overhaul - checkpoint before power loss
- **d80fa5c (2026-05-26):** Step 7 complete - dashboard UI overhaul with all 19 tests passing
- **2388cb7 (2026-05-26):** Implement Step 8 admin and history UI
- **c1bcb1e (2026-05-26):** Polish Step 8 TradeSense UI
- **e7eac03 (2026-05-26):** Step 8.1 complete - dashboard UI tweaking
- **d10511a (2026-05-26):** Finalized Theme changes
- **9f738f6 (2026-05-26):** Fixations
- **8e1b84a (2026-05-26):** Implement Step 9 integration and deployment prep
- **603f39a (2026-05-26):** Mark Step 9 complete

### Phase 3 — Extension, Re-baselining, and Feature Expansion
- **5a799cc (2026-05-27):** Minor changes
- **44ce384 (2026-05-28):** UI/UX Serious Tweaking before step 10 phase 1
- **92b4069 (2026-05-28):** UI/UX Serious Tweaking before step 10 phase 1.5
- **1952095 (2026-05-29):** Phase 1.5.1
- **14c246a (2026-05-29):** Phase 1.5.2
- **ee9beeb (2026-05-29):** Phase 3
- **3eb8595 (2026-05-29):** UI glitch occurs
- **d2bdee3 (2026-05-29):** Sub-Phase 1-4
- **57fb586 (2026-05-30):** Phase 5: extend data to 2026-04-30, canonical 30 assets; landing + TradingView visibility-gated re-init

### Phase 4 — Final Polish, Docs, Responsiveness, and Deployment
- **1a52489 (2026-05-30):** phase something sha
- **238e4a0 (2026-05-30):** I have forgotten
- **4bb2a96 (2026-05-30):** confusion
- **e276ee5 (2026-05-30):** Finalize docs and UI audit checkpoint
- **e95cfb8 (2026-05-30):** Add Codespaces config and fix mobile sidebar header
- **6018bdc (2026-05-31):** Refine responsive dashboard shell and Codespaces setup
- **300ccd2 (2026-05-31):** UI: remove duplicate secondary header and align sidebar action buttons
- **5470947 (2026-05-31):** Fix chart theming and NGX controls
- **91517f0 (2026-05-31):** Fix mobile chart layout
- **fd0f122 (2026-05-31):** Restore NGX chart range controls
- **f9b7eb2 (2026-05-31):** Add Render deployment setup
- **90d9049 (2026-05-31):** something

## 3) File-by-File Change Summary (first commit → current HEAD)

### Root / Documentation / Project Configuration
- **A** `.devcontainer/devcontainer.json` — Added Codespaces/devcontainer setup for cloud development consistency.
- **A** `.dockerignore` — Added Docker build exclusions for local artifacts.
- **M** `.gitignore` — Updated ignore rules to reflect evolved project structure and generated artifacts.
- **M** `DATA_SOURCES.md` — Expanded provenance and safety notes; updated operational guidance and date-range framing.
- **M** `DEMO_FLOW.md` — Revised defense script to include current UI/data behavior (simulator, replay, audit logs, dark-terminal framing).
- **A** `Dockerfile` — Added container build path for unified backend+frontend service deployment.
- **A** `PHASE_10.md` — Added phase checkpoint and documentation/audit status tracking.
- **M** `README.md` — Reframed product as TradeSense NG, documented current state, env controls, Codespaces and Render deployment.
- **M** `VISION.md` — Updated scope wording, constraints, and success criteria to match implemented system state.
- **D** `agent.context.md` — Removed private locked-decision context file from tracked repository state.
- **D** `agent.instructions.md` — Removed private agent instruction artifact.
- **D** `agent.prompt.md` — Removed private agent prompt artifact.
- **M** `agent.tasks.md` — Progressed task tracker from mostly pending to completed implementation stages.
- **M** `architecture.md` — Updated architecture narrative with current data-range and resource-safety operational notes.

### Backend — Dataset (`backend/data`)
- **A** `backend/data/ACCESSCORP.csv` — Added local OHLCV dataset for ACCESSCORP.
- **A** `backend/data/ADA.csv` — Added local OHLCV dataset for ADA.
- **A** `backend/data/AIRTELAFRI.csv` — Added local OHLCV dataset for AIRTELAFRI.
- **A** `backend/data/BNB.csv` — Added local OHLCV dataset for BNB.
- **A** `backend/data/BTC.csv` — Added local OHLCV dataset for BTC.
- **A** `backend/data/BUACEMENT.csv` — Added local OHLCV dataset for BUACEMENT.
- **A** `backend/data/DANGCEM.csv` — Added local OHLCV dataset for DANGCEM.
- **A** `backend/data/DOGE.csv` — Added local OHLCV dataset for DOGE.
- **A** `backend/data/DOT.csv` — Added local OHLCV dataset for DOT.
- **A** `backend/data/ETH.csv` — Added local OHLCV dataset for ETH.
- **A** `backend/data/FBNH.csv` — Added local OHLCV dataset for FBNH.
- **A** `backend/data/FCMB.csv` — Added local OHLCV dataset for FCMB.
- **A** `backend/data/FIDELITYBK.csv` — Added local OHLCV dataset for FIDELITYBK.
- **A** `backend/data/GTCO.csv` — Added local OHLCV dataset for GTCO.
- **A** `backend/data/LTC.csv` — Added local OHLCV dataset for LTC.
- **A** `backend/data/MTNN.csv` — Added local OHLCV dataset for MTNN.
- **A** `backend/data/NB.csv` — Added local OHLCV dataset for NB.
- **A** `backend/data/NESTLE.csv` — Added local OHLCV dataset for NESTLE.
- **A** `backend/data/OANDO.csv` — Added local OHLCV dataset for OANDO.
- **A** `backend/data/PRESCO.csv` — Added local OHLCV dataset for PRESCO.
- **A** `backend/data/SEPLAT.csv` — Added local OHLCV dataset for SEPLAT.
- **A** `backend/data/SOL.csv` — Added local OHLCV dataset for SOL.
- **A** `backend/data/STANBIC.csv` — Added local OHLCV dataset for STANBIC.
- **A** `backend/data/TRANSCORP.csv` — Added local OHLCV dataset for TRANSCORP.
- **A** `backend/data/TRX.csv` — Added local OHLCV dataset for TRX.
- **A** `backend/data/UBA.csv` — Added local OHLCV dataset for UBA.
- **A** `backend/data/UCAP.csv` — Added local OHLCV dataset for UCAP.
- **A** `backend/data/WAPCO.csv` — Added local OHLCV dataset for WAPCO.
- **A** `backend/data/XRP.csv` — Added local OHLCV dataset for XRP.
- **A** `backend/data/ZENITHBANK.csv` — Added local OHLCV dataset for ZENITHBANK.

### Backend — Runtime, API, Engine, and Tests
- **A** `backend/logs/app.log` — Added runtime application log file for auditability.
- **A** `backend/logs/app.log.1` — Added rotated log file artifact.
- **M** `backend/requirements.txt` — Expanded dependencies for API, ML, auth, testing, and operations.
- **A** `backend/src/api/__init__.py` — Added API package initializer.
- **A** `backend/src/api/admin.py` — Added admin endpoints (stats, users, predictions, audit/admin actions).
- **A** `backend/src/api/assets.py` — Added asset metadata endpoint with normalized asset typing.
- **A** `backend/src/api/auth.py` — Added registration, login, and password-change flows.
- **A** `backend/src/api/limiter.py` — Added API rate-limiting integration.
- **A** `backend/src/api/main.py` — Added FastAPI app bootstrap, routing, middleware, and startup logic.
- **A** `backend/src/api/predict.py` — Added prediction endpoint serving OHLCV, indicators, signal, and insight.
- **A** `backend/src/api/security.py` — Added JWT/auth security helpers and authorization guards.
- **A** `backend/src/engine/download_real_data.py` — Added controlled real-data downloader with explicit gating.
- **A** `backend/src/engine/generate_synthetic_data.py` — Added deterministic synthetic fallback data generation.
- **A** `backend/src/engine/train.py` — Added model training pipeline for Random Forest inference artifacts.
- **A** `backend/tests/test_admin.py` — Added backend tests for admin API behavior.
- **A** `backend/tests/test_api.py` — Added backend tests for API contract and responses.
- **A** `backend/tests/test_auth.py` — Added backend tests for authentication and authorization.
- **A** `backend/tests/test_download_real_data.py` — Added tests for download guardrails and data fetch logic.
- **A** `backend/tests/test_generate_synthetic_data.py` — Added tests for synthetic data generation behavior.
- **A** `backend/tests/test_train.py` — Added tests for model training workflow.

### Frontend — App Scaffold, Components, Utilities, and Tests
- **A** `frontend/.gitignore` — Added frontend-specific ignore rules.
- **A** `frontend/README.md` — Added frontend run/build guidance.
- **A** `frontend/eslint.config.js` — Added linting configuration.
- **A** `frontend/index.html` — Added frontend HTML entry point.
- **A** `frontend/package-lock.json` — Added locked frontend dependency graph.
- **A** `frontend/package.json` — Added frontend dependency and script manifest.
- **A** `frontend/postcss.config.js` — Added PostCSS processing setup.
- **A** `frontend/public/favicon.svg` — Added app favicon asset.
- **A** `frontend/public/icons.svg` — Added shared icon sprite asset.
- **A** `frontend/src/App.css` — Added global app-level styling.
- **A** `frontend/src/App.jsx` — Added root app shell, auth routing logic, theme state, navigation, and view orchestration.
- **A** `frontend/src/LandingPage.jsx` — Added product landing experience and quick-guide trigger.
- **A** `frontend/src/assets/hero.png` — Added landing hero image asset.
- **A** `frontend/src/assets/react.svg` — Added scaffold icon asset.
- **A** `frontend/src/assets/vite.svg` — Added scaffold icon asset.
- **A** `frontend/src/components/AdminPanel.jsx` — Added admin UI (stats/users/predictions/assets/logs) and confirmed destructive actions.
- **A** `frontend/src/components/AssetSelector.jsx` — Added asset selection control.
- **A** `frontend/src/components/AuditLogs.jsx` — Added audit-log viewing UI with search/filter support.
- **A** `frontend/src/components/AvatarMenu.jsx` — Added user avatar menu interactions.
- **A** `frontend/src/components/CryptoWidget.jsx` — Added lazy-loaded crypto market preview wrapper.
- **A** `frontend/src/components/Dashboard.jsx` — Added main dashboard container and module composition.
- **A** `frontend/src/components/IndicatorCards.jsx` — Added indicator visualization cards.
- **A** `frontend/src/components/InsightBar.jsx` — Added deterministic textual insight display.
- **A** `frontend/src/components/LoginForm.jsx` — Added login UI and workflow.
- **A** `frontend/src/components/PredictionHistory.jsx` — Added user prediction history table.
- **A** `frontend/src/components/PredictionPanel.jsx` — Added signal/return/confidence presentation.
- **A** `frontend/src/components/PriceChart.jsx` — Added main chart rendering and controls.
- **A** `frontend/src/components/QuickGuide.jsx` — Added in-app guided walkthrough modal.
- **A** `frontend/src/components/RegisterForm.jsx` — Added registration UI and workflow.
- **A** `frontend/src/components/Sidebar.jsx` — Added desktop sidebar + mobile drawer navigation shell.
- **A** `frontend/src/components/SignalSimulator.jsx` — Added what-if simulator for Naira position projection.
- **A** `frontend/src/components/TimeRangeSelector.jsx` — Added chart range controls.
- **A** `frontend/src/components/TopBar.jsx` — Added top navigation and session controls.
- **A** `frontend/src/components/TradingViewWidget.jsx` — Added embedded TradingView widget integration.
- **A** `frontend/src/components/UserMenu.jsx` — Added user action menu controls.
- **A** `frontend/src/index.css` — Added shared theme and utility styles.
- **A** `frontend/src/main.jsx` — Added frontend bootstrapping entrypoint.
- **A** `frontend/src/utils/api.js` — Added authenticated API fetch wrapper and error handling.
- **A** `frontend/tailwind.config.js` — Added Tailwind theme/configuration.
- **A** `frontend/tests/AdminPanel.test.jsx` — Added AdminPanel tests.
- **A** `frontend/tests/App.test.jsx` — Added App shell tests.
- **A** `frontend/tests/AssetSelector.test.jsx` — Added AssetSelector tests.
- **A** `frontend/tests/AuditLogs.test.jsx` — Added AuditLogs tests.
- **A** `frontend/tests/AvatarMenu.test.jsx` — Added AvatarMenu tests.
- **A** `frontend/tests/Dashboard.test.jsx` — Added Dashboard tests.
- **A** `frontend/tests/IndicatorCards.test.jsx` — Added IndicatorCards tests.
- **A** `frontend/tests/InsightBar.test.jsx` — Added InsightBar tests.
- **A** `frontend/tests/LandingPage.test.jsx` — Added LandingPage tests.
- **A** `frontend/tests/LoginForm.test.jsx` — Added LoginForm tests.
- **A** `frontend/tests/PredictionHistory.test.jsx` — Added PredictionHistory tests.
- **A** `frontend/tests/PredictionPanel.test.jsx` — Added PredictionPanel tests.
- **A** `frontend/tests/PriceChart.test.jsx` — Added PriceChart tests.
- **A** `frontend/tests/RegisterForm.test.jsx` — Added RegisterForm tests.
- **A** `frontend/tests/SignalSimulator.test.jsx` — Added SignalSimulator tests.
- **A** `frontend/tests/TimeRangeSelector.test.jsx` — Added TimeRangeSelector tests.
- **A** `frontend/tests/TopBar.test.jsx` — Added TopBar tests.
- **A** `frontend/tests/setup.js` — Added frontend test setup/bootstrap.
- **A** `frontend/vite.config.js` — Added Vite build configuration.
- **A** `frontend/vitest.config.mjs` — Added Vitest test runner configuration.

### Deployment / Utility Scripts
- **A** `render.yaml` — Added Render blueprint for deployment orchestration.
- **A** `scripts/count_chars.js` — Added utility script for textual/stat diagnostics.
- **A** `scripts/dump_balance.js` — Added utility script for delimiter/balance inspection.
- **A** `scripts/find_balance.js` — Added utility script for structural balancing checks.
- **A** `scripts/find_max_balance.js` — Added utility script for max-balance tracing.
- **A** `scripts/find_max_paren.js` — Added utility script for parenthesis-depth analysis.
- **A** `scripts/start.sh` — Added one-command defense-mode startup script.

## 4) Key Design Decisions & Architecture Changes

### VISION.md (Initial plan → Current)
- The core mission remained consistent (AI-assisted retail-trader decision support, offline-friendly operation).
- Scope wording was rebaselined from the original **2022-01-01 to 2024-12-31** plan to the current documented on-disk range ending **2026-04-30**.
- Core feature framing shifted from initial idealized statements toward current-state operational framing (audit logs, mobile drawer support, production-minded constraints).
- Constraint language softened from strict “no live feeds” phrasing to “no live dependency by default,” reflecting optional but controlled external integrations.

### architecture.md (Initial plan → Current)
- The two-layer decoupled architecture and major subsystem boundaries remained unchanged.
- The architecture document now includes explicit operational safety details (download gating through `FORCE_DOWNLOAD`, training CPU guardrails via `RF_N_JOBS`).
- Data layer notes were updated to reflect the larger, current historical snapshot horizon rather than the original 3-year conceptual baseline.

### DATA_SOURCES.md (Initial plan → Current)
- Data provenance evolved from a strictly manual-source narrative (CoinGecko + Investing.com for 5+10 assets) to a mixed model: real downloads where feasible plus deterministic synthetic fallback where needed.
- The document now emphasizes reproducibility, resource safety, and offline stability as explicit design goals.
- Date framing changed from the original 2022–2024 plan to the current repository snapshot ending 2026-04-30.

### agent.context.md (Initial plan → Current)
- `agent.context.md` existed in the first commit and documented locked decisions (asset split, data window, architecture, UX assumptions).
- The file was later deleted, together with related private agent files; implementation and decision context are now represented through public docs (`README.md`, `VISION.md`, `DATA_SOURCES.md`, `architecture.md`, `DEMO_FLOW.md`, `PHASE_10.md`) and code.

## 5) Final Asset & Data Configuration

### Final asset universe in current code (`backend/src/api/assets.py`)

**Crypto assets (10):**
BTC, ETH, BNB, SOL, ADA, XRP, DOGE, LTC, TRX, DOT

**NGX assets (20):**
DANGCEM, MTNN, AIRTELAFRI, BUACEMENT, GTCO, ZENITHBANK, SEPLAT, FBNH, NB, ACCESSCORP, UBA, STANBIC, FIDELITYBK, FCMB, UCAP, TRANSCORP, OANDO, PRESCO, WAPCO, NESTLE

**Total:** 30 assets.

### Dataset horizon
- Initial design target: **2022-01-01 to 2024-12-31**.
- Current repository state (CSV files on disk): **2020-01-01 to 2026-04-30**.

> Note: The current codebase reflects a 30-asset configuration with a 10-crypto/20-NGX split, while earlier planning documents referenced a smaller 5-crypto/10-NGX set.

## 6) New & Modified Features (relative to initial plan)

### Added or significantly expanded
- Product-layer branding surfaced as **TradeSense NG** while retaining the academic project title.
- Dedicated **LandingPage** flow with branded hero experience and guided entry.
- Embedded **TradingViewWidget** integration for live-style crypto market visualization.
- **SignalSimulator** (what-if Naira outcome estimation) added as a separate decision-support module.
- **QuickGuide** modal introduced for guided onboarding/presentation flow.
- Admin shell expanded with **Audit Logs** visibility and search/filter capabilities.
- Admin panel includes **destructive actions** with confirmation modals (user deletion, prediction-history clearing).
- Significant **responsive UX** hardening (desktop sidebar + mobile drawer/layout fixes).
- **Theme system** implemented and persisted (dark/light handling across app surfaces), with defense messaging favoring a consistent dark terminal presentation.
- Deployment and operations maturity increased through `.devcontainer`, Docker/Render artifacts, startup scripts, and resource-safety controls.

### Removed, simplified, or reframed
- Private planning/control artifacts (`agent.context.md`, `agent.instructions.md`, `agent.prompt.md`) were removed from tracked state.
- The defense narrative explicitly reframes simulation as **not paper trading** and not brokerage execution.
- No persistent preset-management subsystem is present in the current tracked implementation; feature scope appears simplified to direct dashboard/simulator workflows.
- Original strict “manual source only” data narrative was simplified into a practical hybrid (real + deterministic synthetic fallback) to keep offline demos stable.
