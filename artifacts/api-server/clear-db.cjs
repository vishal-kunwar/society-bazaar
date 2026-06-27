const pg = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const client = new pg.Client({
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
