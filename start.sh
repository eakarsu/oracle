#!/usr/bin/env bash

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=${RUNTIME_PROJECT_SOURCE:-$SCRIPT_DIR}
BACKEND_PID=''
FRONTEND_PID=''

fail() {
  printf '%s\n' "Startup refused: $*" >&2
  exit 1
}

[ -d "$PROJECT_DIR/backend/node_modules" ] || fail "backend dependencies are missing; run npm ci in backend"
[ -x "$PROJECT_DIR/frontend/node_modules/.bin/vite" ] || fail "frontend dependencies are missing; run npm ci in frontend"

if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  . "$PROJECT_DIR/.env"
  set +a
fi

npm --prefix "$PROJECT_DIR/backend" run check:config
RUNTIME_PORTS=$(node "$PROJECT_DIR/backend/scripts/runtime-ports.js")
BACKEND_PORT=$(printf '%s\n' "$RUNTIME_PORTS" | sed -n '1p')
FRONTEND_PORT=$(printf '%s\n' "$RUNTIME_PORTS" | sed -n '2p')
export BACKEND_PORT FRONTEND_PORT

[ "$BACKEND_PORT" != "$FRONTEND_PORT" ] || fail "backend and frontend ports must be distinct"
export BACKEND_HOST=127.0.0.1
if [ "${NODE_ENV:-production}" != production ]; then
  export CORS_ORIGINS="${CORS_ORIGINS:-http://127.0.0.1:$FRONTEND_PORT}"
fi

for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  case "$port" in
    ''|*[!0-9]*) fail "ports must be numeric" ;;
  esac
  if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    fail "ports must be between 1 and 65535"
  fi
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "port $port is already in use; this launcher will not terminate another process"
  fi
done

node "$PROJECT_DIR/backend/migrations/run.js"
node "$PROJECT_DIR/backend/scripts/provision-runtime-admin.js"
npm --prefix "$PROJECT_DIR/backend" run check:ready

cleanup() {
  trap - INT TERM EXIT
  [ -z "$BACKEND_PID" ] || kill "$BACKEND_PID" 2>/dev/null || true
  [ -z "$FRONTEND_PID" ] || kill "$FRONTEND_PID" 2>/dev/null || true
  [ -z "$BACKEND_PID" ] || wait "$BACKEND_PID" 2>/dev/null || true
  [ -z "$FRONTEND_PID" ] || wait "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

printf '%s\n' "Starting bounded procurement API and UI on loopback only."
npm --prefix "$PROJECT_DIR/backend" start &
BACKEND_PID=$!
BACKEND_PORT="$BACKEND_PORT" FRONTEND_PORT="$FRONTEND_PORT" \
  npm --prefix "$PROJECT_DIR/frontend" run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort &
FRONTEND_PID=$!

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

fail "a managed service exited; both services have been stopped"
