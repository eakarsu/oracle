#!/bin/bash

#==============================================================================
# Oracle ERP - Application Startup Script
#==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              🏢  ORACLE ERP SYSTEM v1.0                      ║"
echo "║              Enterprise Resource Planning                    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found! Please create one from .env.example${NC}"
    exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

#==============================================================================
# Clean up used ports
#==============================================================================
echo -e "\n${YELLOW}▸ Cleaning up ports...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "  ${YELLOW}Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    echo -e "  ${GREEN}✓ Port $port is free${NC}"
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

#==============================================================================
# Check dependencies
#==============================================================================
echo -e "\n${YELLOW}▸ Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL client not found. Please install PostgreSQL${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓ PostgreSQL client found${NC}"

#==============================================================================
# Check PostgreSQL is running
#==============================================================================
echo -e "\n${YELLOW}▸ Checking PostgreSQL...${NC}"
if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
        sudo systemctl start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "  ${RED}✗ Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    fi
fi

#==============================================================================
# Create database if not exists
#==============================================================================
echo -e "\n${YELLOW}▸ Setting up database...${NC}"
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tc \
    "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-oracle_erp}'" 2>/dev/null | grep -q 1 || \
    psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -c \
    "CREATE DATABASE ${DB_NAME:-oracle_erp}" 2>/dev/null
echo -e "  ${GREEN}✓ Database '${DB_NAME:-oracle_erp}' ready${NC}"

#==============================================================================
# Install backend dependencies
#==============================================================================
echo -e "\n${YELLOW}▸ Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
    npm install --silent
else
    echo -e "  ${CYAN}Dependencies already installed, checking for updates...${NC}"
    npm install --silent
fi
echo -e "  ${GREEN}✓ Backend dependencies installed${NC}"

#==============================================================================
# Install frontend dependencies
#==============================================================================
echo -e "\n${YELLOW}▸ Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --silent
else
    echo -e "  ${CYAN}Dependencies already installed, checking for updates...${NC}"
    npm install --silent
fi
echo -e "  ${GREEN}✓ Frontend dependencies installed${NC}"

#==============================================================================
# Seed database
#==============================================================================
echo -e "\n${YELLOW}▸ Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/backend"
node seed/index.js
echo -e "  ${GREEN}✓ Database seeded successfully${NC}"

#==============================================================================
# Start services with hot reload
#==============================================================================
echo -e "\n${BLUE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Starting Oracle ERP System...${NC}"
echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Backend:${NC}   http://localhost:${BACKEND_PORT}"
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:${FRONTEND_PORT}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Trap to clean up background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down Oracle ERP...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    cleanup_port $BACKEND_PORT
    cleanup_port $FRONTEND_PORT
    echo -e "${GREEN}✓ Oracle ERP stopped${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
npx nodemon --watch . --ext js,json --ignore node_modules server.js &

# Start frontend with hot reload (Vite has built-in HMR)
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npx vite --port $FRONTEND_PORT --host &

# Wait for all background processes
wait
