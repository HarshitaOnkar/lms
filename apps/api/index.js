const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

app.get("/", async (_req, res) => {
  let connection;
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ message: "DATABASE_URL is missing" });
    }

    connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await connection.query("SELECT 1");
    return res.status(200).send("API working");
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({ message: "Database connection failed" });
  } finally {
    if (connection) {
      await connection.end().catch(() => undefined);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

