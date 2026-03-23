import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL missing" });
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    const [rows] = await connection.execute("SELECT 1 as test");

    await connection.end();

    return res.status(200).json({
      message: "API working ✅",
      result: rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message
    });
  }
}