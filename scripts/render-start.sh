#!/usr/bin/env sh
set -eu

cd backend
exec uvicorn src.api.main:app --host 0.0.0.0 --port "${PORT:-10000}"
