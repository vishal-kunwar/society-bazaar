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

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
