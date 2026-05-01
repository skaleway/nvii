#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

DB_PORT="${DB_PORT:-5489}"
if ss -ltn | rg -q ":${DB_PORT}\\b"; then
  echo "Port ${DB_PORT} is already in use."
  echo "Run with a different port, for example: DB_PORT=5434 ./run-dev.sh"
  exit 1
fi

DATABASE_URL="postgresql://envi:envi_password@localhost:${DB_PORT}/envi"

echo "Installing workspace dependencies..."
pnpm install

echo "Ensuring environment files exist..."
mkdir -p packages/database apps/web
if [ ! -f "packages/database/.env" ]; then
  printf 'DATABASE_URL="%s"\n' "$DATABASE_URL" > packages/database/.env
fi
if [ ! -f "apps/web/.env" ]; then
  printf 'DATABASE_URL="%s"\n' "$DATABASE_URL" > apps/web/.env
fi

echo "Starting PostgreSQL database with Docker Compose on port ${DB_PORT}..."
DB_PORT="$DB_PORT" docker compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations..."
pnpm --filter @nvii/db db:migrate

echo "Starting web dev server..."
pnpm --filter @nvii/web dev
