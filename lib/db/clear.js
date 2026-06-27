import pg from "pg";
import path from "path";
import { loadEnvFile } from "process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch (e) {}

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  console.log("Connected to database. Truncating tables...");
  await client.query("TRUNCATE TABLE societies CASCADE;");
  console.log("Truncated successfully.");
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
