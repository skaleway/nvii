echo "Installing global packages"
pnpm install

echo "Starting PostgreSQL database with Docker Compose..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Checking if .env in packages/database"
if [ ! -f "packages/database/.env" ]; then
    echo ".env file does not exist in packages/database"
    exit 1
fi

echo "Running prisma migrate..."
cd packages/database && pnpm prisma migrate dev

echo "Removing node_modules in apps/web (not sure why but this is necessary)"
cd apps/web

if [ ! -f ".env" ]; then
    echo ".env file does not exist in apps/web"
    exit 1
fi

rm -rf node_modules

echo "Installing packages in web again"
pnpm install

echo "Starting next.js server..."
pnpm run dev &
