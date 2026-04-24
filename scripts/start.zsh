#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_PYTHON="$ROOT_DIR/.venv/bin/python"

if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "Missing backend or frontend directories."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed."
  exit 1
fi

if [[ ! -x "$VENV_PYTHON" ]]; then
  echo "Missing Python virtual environment at $VENV_PYTHON"
  echo "Create it with: python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt"
  exit 1
fi

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
"$VENV_PYTHON" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cd "$FRONTEND_DIR"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

sleep 2
open "http://127.0.0.1:5173" || true

echo "Tracker is running. Press Ctrl+C to stop."
wait
