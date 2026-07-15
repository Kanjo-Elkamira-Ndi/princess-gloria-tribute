/**
 * Run all migration SQL files against the database.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/db-migrate.ts
 *
 * Reads every *.sql file in db/migrations/ sorted by filename,
 * then runs db/schema.sql (idempotent — uses IF NOT EXISTS).
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import { loadEnv } from "./load-env";

loadEnv();

const ROOT = resolve(__dirname, "..");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(url, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  // 1. Run schema.sql (idempotent)
  const schemaSql = readFileSync(resolve(ROOT, "db/schema.sql"), "utf8");
  console.log("▸ Running db/schema.sql ...");
  await sql.unsafe(schemaSql);
  console.log("  ✓ Schema applied");

  // 2. Run any migration files in db/migrations/
  const migrationsDir = resolve(ROOT, "db/migrations");
  let files: string[] = [];
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    // No migrations directory — that's fine
  }

  for (const file of files) {
    const filePath = resolve(migrationsDir, file);
    const sqlContent = readFileSync(filePath, "utf8");
    console.log(`▸ Running ${file} ...`);
    await sql.unsafe(sqlContent);
    console.log(`  ✓ ${file} applied`);
  }

  await sql.end();
  console.log("\nAll migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
