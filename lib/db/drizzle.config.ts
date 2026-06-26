import { defineConfig } from "drizzle-kit";
import path from "path";
import { loadEnvFile } from "process";

// Try loading environment variables from .env file
try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch (e) {
  try {
    loadEnvFile(path.resolve(process.cwd(), "../../.env"));
  } catch (e2) {}
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
