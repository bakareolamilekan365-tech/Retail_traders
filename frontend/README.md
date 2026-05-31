# TradeSense NG Frontend

This is the React + Vite client for the Intelligent Investment Recommendation Assistant.

## What It Does

- Login, register, and password change flows.
- Dashboard with asset selector, chart, indicators, prediction panel, and insight bar.
- Crypto charting with TradingView-style visualisation.
- Desktop sidebar and mobile drawer navigation.
- Admin Audit Logs page with client-side search and filter.

## Development

```bash
cd frontend
npm install
npm run dev
```

The dev server usually runs at http://localhost:5173.

## Build

```bash
cd frontend
npm run build
```

## Tests

```bash
cd frontend
npx vitest run
```

## Notes

- The frontend expects the backend API to be running locally.
- The chart view slices the series returned by the backend instead of requesting short live windows.
- This project is designed for the local demo build; no Docker is required on this machine.
