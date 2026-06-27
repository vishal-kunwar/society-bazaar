import postgres from "postgres";
import path from "path";
import { loadEnvFile } from "process";

try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch (e) {
  try {
    loadEnvFile(path.resolve(process.cwd(), "../../.env"));
  } catch (e2) {}
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  console.log("Connected to database. Truncating tables...");
  await sql`TRUNCATE TABLE societies CASCADE;`;
  console.log("Truncated successfully.");
  await sql.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
