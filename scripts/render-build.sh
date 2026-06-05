#!/usr/bin/env sh
set -eu

pip install -r backend/requirements.txt
npm ci --prefix frontend
npm run build --prefix frontend
