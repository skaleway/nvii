// prisma/prisma.config.ts
import "dotenv/config"; // Loads environment variables from .env file
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Configure the datasource URL here for CLI commands (like migrate and generate)
  datasource: {
    url: env("DATABASE_URL"),
  },
  // You can add other configurations here (e.g., migrations path, seed script)
  migrations: {
    path: "prisma/migrations",
  },
});
