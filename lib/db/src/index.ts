import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { loadEnvFile } from "process";
import path from "path";

// Try loading environment variables from .env file
try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch (e) {
  try {
    loadEnvFile(path.resolve(process.cwd(), "../../.env"));
  } catch (e2) {}
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
