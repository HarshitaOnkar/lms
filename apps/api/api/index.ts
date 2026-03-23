const mysql = require("mysql2/promise");

const REQUIRED_ENV = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

let pool;
let configLogged = false;

function getEnvConfig() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key] || !process.env[key].trim());

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(", ")}`);
    error.code = "MISSING_ENV";
    throw error;
  }

  return {
    databaseUrl: process.env.DATABASE_URL,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  };
}

async function getPool() {
  if (pool) return pool;

  const { databaseUrl } = getEnvConfig();

  if (!configLogged) {
    console.log("[api] Environment loaded:", {
      DATABASE_URL: "set",
      JWT_ACCESS_SECRET: "set",
      JWT_REFRESH_SECRET: "set",
    });
    configLogged = true;
  }

  pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
  });

  // Verify DB connectivity once on cold start
  await pool.query("SELECT 1");
  console.log("[api] MySQL connected");

  return pool;
}

module.exports = async function handler(req, res) {
  // Simple /api health route
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await getPool();
    return res.status(200).json({
      message: "API working",
      db: "connected",
    });
  } catch (err) {
    console.error("[api] Startup/DB error:", err);

    if (err && err.code === "MISSING_ENV") {
      return res.status(500).json({
        message: "API is not configured",
        error: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
