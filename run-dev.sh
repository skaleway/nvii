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
for env_file in packages/database/.env apps/web/.env; do
  if [[ -f "$env_file" ]] && rg -q '^[[:space:]]*DATABASE_URL[[:space:]]*=' "$env_file"; then
    sed -i -E "s|^[[:space:]]*DATABASE_URL[[:space:]]*=.*|DATABASE_URL=\"${DATABASE_URL}\"|" "$env_file"
  else
    printf '\nDATABASE_URL="%s"\n' "$DATABASE_URL" >> "$env_file"
  fi
done

echo "Starting PostgreSQL database with Docker Compose on port ${DB_PORT}..."
DB_PORT="$DB_PORT" docker compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations..."
pnpm --filter @nvii/db db:migrate

echo "Starting web dev server..."
pnpm --filter @nvii/web dev
