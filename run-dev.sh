echo "Installing global packages"
pnpm install

echo "[packages/core] Installing packages"
cd packages/core && pnpm run build

echo "[packages/vite] Installing packages"
cd ../vite && pnpm run build

echo "Checking if .env in packages/database"
if [ ! -f "../database/.env" ]; then
    echo ".env file does not exist in packages/database"
    exit 1
fi

echo "Running prisma migrate..."
cd ../database && pnpm prisma migrate dev

echo "Removing node_modules in apps/web (not sure why but this is necessary)"
cd ../../apps/web

if [ ! -f ".env" ]; then
    echo ".env file does not exist in apps/web"
    exit 1
fi

rm -rf node_modules

echo "Installing packages in web again"
pnpm install

echo "Starting next.js server..."
pnpm run dev &
