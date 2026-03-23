const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const REQUIRED_ENV = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];

function readConfig() {
  const missing = REQUIRED_ENV.filter((key) => {
    const val = process.env[key];
    return !val || !String(val).trim();
  });

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    databaseUrl: process.env.DATABASE_URL
  };
}

let pool = null;

async function getPool() {
  if (pool) return pool;

  const config = readConfig();

  // Debug-friendly startup logs (without leaking secrets).
  // eslint-disable-next-line no-console
  console.log("[api] env loaded", {
    DATABASE_URL: "set",
    JWT_ACCESS_SECRET: "set",
    JWT_REFRESH_SECRET: "set"
  });

  pool = mysql.createPool({
    uri: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  await pool.query("SELECT 1");
  // eslint-disable-next-line no-console
  console.log("[api] database connected");

  return pool;
}

app.get("/", async (_req, res) => {
  try {
    await getPool();
    return res.status(200).json({ message: "API working" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[api] startup/db error", error);
    return res.status(500).json({
      message: "API is not configured",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

