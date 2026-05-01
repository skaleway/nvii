import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isCiLike =
  process.env.CI === "true" ||
  process.env.CI === "1" ||
  process.env.VERCEL === "1";

const datasourceUrl =
  process.env.DATABASE_URL ??
  (isCiLike
    ? "postgresql://postgres:postgres@127.0.0.1:5432/prisma_generate_placeholder"
    : env("DATABASE_URL"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
