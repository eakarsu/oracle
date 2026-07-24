#!/usr/bin/env bash

set -eu

# Local demo credential bridge (Codex managed)
demo_credentials_project_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ -f "$demo_credentials_project_dir/.env" ]; then
  while IFS= read -r demo_credentials_line || [ -n "$demo_credentials_line" ]; do
    case "$demo_credentials_line" in ''|'#'*) continue ;; esac
    demo_credentials_line="${demo_credentials_line#export }"
    demo_credentials_key="${demo_credentials_line%%=*}"
    demo_credentials_value="${demo_credentials_line#*=}"
    case "$demo_credentials_key" in
      NODE_ENV|ENABLE_DEMO_CREDENTIAL_AUTOFILL|DEMO_EMAIL|DEMO_PASSWORD|SEED_ADMIN_EMAIL|SEED_ADMIN_PASSWORD|SEED_USER_EMAIL|SEED_USER_PASSWORD|PROVISION_ADMIN_EMAIL|PROVISION_ADMIN_PASSWORD|BOOTSTRAP_ADMIN_EMAIL|BOOTSTRAP_ADMIN_PASSWORD|ADMIN_EMAIL|ADMIN_PASSWORD|DEFAULT_EMAIL|DEFAULT_PASSWORD|DEMO_TENANT|BOOTSTRAP_TENANT_SLUG|GOVERNANCE_TENANT_ID|TENANT_ID) ;;
      *) continue ;;
    esac
    [ -n "${!demo_credentials_key+x}" ] && continue
    demo_credentials_first="${demo_credentials_value:0:1}"
    demo_credentials_last="${demo_credentials_value: -1}"
    if { [ "$demo_credentials_first" = '"' ] && [ "$demo_credentials_last" = '"' ]; } || { [ "$demo_credentials_first" = "'" ] && [ "$demo_credentials_last" = "'" ]; }; then
      demo_credentials_value="${demo_credentials_value:1:${#demo_credentials_value}-2}"
    fi
    export "$demo_credentials_key=$demo_credentials_value"
  done < "$demo_credentials_project_dir/.env"
fi
demo_credentials_email=""
demo_credentials_password=""
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
if [ -n "${PROVISION_ADMIN_EMAIL:-}" ] && [ -n "${PROVISION_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$PROVISION_ADMIN_EMAIL"
  demo_credentials_password="$PROVISION_ADMIN_PASSWORD"
elif [ -n "${BOOTSTRAP_ADMIN_EMAIL:-}" ] && [ -n "${BOOTSTRAP_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$BOOTSTRAP_ADMIN_EMAIL"
  demo_credentials_password="$BOOTSTRAP_ADMIN_PASSWORD"
elif [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$SEED_ADMIN_EMAIL"
  demo_credentials_password="$SEED_ADMIN_PASSWORD"
elif [ -n "${SEED_USER_EMAIL:-}" ] && [ -n "${SEED_USER_PASSWORD:-}" ]; then
  demo_credentials_email="$SEED_USER_EMAIL"
  demo_credentials_password="$SEED_USER_PASSWORD"
elif [ -n "${DEMO_EMAIL:-}" ] && [ -n "${DEMO_PASSWORD:-}" ]; then
  demo_credentials_email="$DEMO_EMAIL"
  demo_credentials_password="$DEMO_PASSWORD"
elif [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$ADMIN_EMAIL"
  demo_credentials_password="$ADMIN_PASSWORD"
elif [ -n "${DEFAULT_EMAIL:-}" ] && [ -n "${DEFAULT_PASSWORD:-}" ]; then
  demo_credentials_email="$DEFAULT_EMAIL"
  demo_credentials_password="$DEFAULT_PASSWORD"
fi
if [ "${NODE_ENV:-development}" != production ] && [ "${ENABLE_DEMO_CREDENTIAL_AUTOFILL:-true}" = true ] && [ -n "$demo_credentials_email" ] && [ -n "$demo_credentials_password" ]; then
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export NEXT_PUBLIC_DEMO_EMAIL="$demo_credentials_email"
  export NEXT_PUBLIC_DEMO_PASSWORD="$demo_credentials_password"
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export VITE_DEMO_EMAIL="$demo_credentials_email"
  export VITE_DEMO_PASSWORD="$demo_credentials_password"
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export REACT_APP_DEMO_EMAIL="$demo_credentials_email"
  export REACT_APP_DEMO_PASSWORD="$demo_credentials_password"
  if [ -n "$demo_credentials_tenant" ]; then
    export NEXT_PUBLIC_DEMO_TENANT="$demo_credentials_tenant"
    export VITE_DEMO_TENANT="$demo_credentials_tenant"
    export REACT_APP_DEMO_TENANT="$demo_credentials_tenant"
  else
    unset NEXT_PUBLIC_DEMO_TENANT VITE_DEMO_TENANT REACT_APP_DEMO_TENANT
  fi
else
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  unset NEXT_PUBLIC_DEMO_EMAIL NEXT_PUBLIC_DEMO_PASSWORD NEXT_PUBLIC_DEMO_TENANT
  unset VITE_DEMO_EMAIL VITE_DEMO_PASSWORD VITE_DEMO_TENANT
  unset REACT_APP_DEMO_EMAIL REACT_APP_DEMO_PASSWORD REACT_APP_DEMO_TENANT
fi
unset demo_credentials_email demo_credentials_password demo_credentials_tenant demo_credentials_project_dir demo_credentials_line demo_credentials_key demo_credentials_value demo_credentials_first demo_credentials_last

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
