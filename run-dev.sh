#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# ripgrep is optional: fall back to grep when rg is not installed.
command -v rg >/dev/null 2>&1 || rg() { grep -E "$@"; }

# Prefer nvm's pnpm: the standalone shim under PNPM_HOME is broken in some
# envs (it feeds the pnpm binary to node instead of executing it).
for _pnpm_bin in "${NVM_DIR:-$HOME/.nvm}"/versions/node/*/bin/pnpm; do
  if [[ -x "$_pnpm_bin" ]]; then
    export PATH="$(dirname "$_pnpm_bin"):$PATH"
    break
  fi
done
unset _pnpm_bin

DB_PORT="${DB_PORT:-5489}"
DB_ALREADY_UP=""
if ss -ltn | rg -q ":${DB_PORT}\\b"; then
  if docker ps --format '{{.Names}}' 2>/dev/null | rg -q '^envi-db$'; then
    echo "Port ${DB_PORT} is already serving envi-db, reusing it."
    DB_ALREADY_UP=1
  else
    echo "Port ${DB_PORT} is already in use by something else."
    echo "Run with a different port, for example: DB_PORT=5434 ./run-dev.sh"
    exit 1
  fi
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

if [[ -n "$DB_ALREADY_UP" ]]; then
  echo "Skipping database start, using the running container."
else
  echo "Starting PostgreSQL database with Docker Compose on port ${DB_PORT}..."
  DB_PORT="$DB_PORT" docker compose up -d

  echo "Waiting for database to be ready..."
  sleep 5
fi

echo "Running Prisma migrations..."
pnpm --filter @nvii/db db:migrate

echo "Starting web dev server..."
pnpm --filter @nvii/web dev
