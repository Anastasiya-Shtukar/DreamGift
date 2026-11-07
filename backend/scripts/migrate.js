import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const migrationsDir = path.resolve("migrations");

async function migrate() {
  const files = await readdir(migrationsDir);

  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  const client = await pool.connect();

  try {
    // Zapobiega równoczesnemu wykonywaniu migracji
    await client.query("SELECT pg_advisory_lock(123456789)");

    const result = await client.query("SELECT filename FROM schema_migrations");

    const executedFiles = new Set(result.rows.map((row) => row.filename));

    const pendingFiles = sqlFiles.filter((file) => !executedFiles.has(file));

    if (pendingFiles.length === 0) {
      console.log("Database is up to date.");
      return;
    }

    for (const file of pendingFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await readFile(filePath, "utf8");

      try {
        await client.query("BEGIN");

        await client.query(sql);

        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);

        await client.query("COMMIT");

        console.log(`Applied migration: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(123456789)");
    } finally {
      client.release();
    }
  }
}

migrate()
  .catch((error) => {
    console.error("Migration error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
