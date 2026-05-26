#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
DIST_DIR="$FRONTEND_DIR/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "Building frontend..."
  npm --prefix "$FRONTEND_DIR" run build
fi

export PYTHONPATH="$BACKEND_DIR/src${PYTHONPATH:+:$PYTHONPATH}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///$BACKEND_DIR/data/app.db}"

cd "$BACKEND_DIR"
exec uvicorn src.api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
