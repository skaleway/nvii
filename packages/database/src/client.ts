// packages/database/src/client.ts

import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Import the adapter
import pg from "pg"; // Import the driver

// Ensure environment variables are loaded if this file runs standalone
// import 'dotenv/config'; // Add this line if needed, based on your env setup

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Define the connection string (it reads from process.env.DATABASE_URL)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Instantiate the driver and adapter
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Pass the adapter to the PrismaClient constructor
export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export * from "../generated/client";
