import express from "express";
import pool from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(`SELECT NOW();`);
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      error: "Database query failed",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
