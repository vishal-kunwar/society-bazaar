import pg from "pg";
import { loadEnvFile } from "process";
import path from "path";

try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch (e) {
  try {
    loadEnvFile(path.resolve(process.cwd(), "../../.env"));
  } catch (e2) {}
}

const connectionString = process.env.DATABASE_URL;
console.log("Connecting to:", connectionString ? connectionString.replace(/:[^:@\s]+@/, ":****@") : "undefined");

const pool = new pg.Pool({ connectionString });

console.log("Sending query...");
try {
  const res = await pool.query("SELECT 1;");
  console.log("Success! Query result:", res.rows);
} catch (err) {
  console.error("Connection failed with error:", err);
} finally {
  await pool.end();
}
