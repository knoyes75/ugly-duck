#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

echo "🦆 Ugly Duck — Starting up..."

# Install backend deps if needed
if [ ! -d "$BACKEND/.venv" ]; then
  echo "📦 Installing backend dependencies..."
  cd "$BACKEND"
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
  .venv/bin/playwright install chromium --with-deps
fi

# Install frontend deps if needed
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd "$FRONTEND"
  npm install
fi

# Build frontend
echo "🔨 Building frontend..."
cd "$FRONTEND"
npm run build

# Start backend (serves built frontend + API)
echo "🚀 Starting server at http://localhost:8000"
cd "$BACKEND"
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
