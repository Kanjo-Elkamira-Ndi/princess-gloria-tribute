/**
 * Full database setup: migrations + admin seed.
 *
 * Usage:
 *   DATABASE_URL=... ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... \
 *     npx tsx scripts/db-deploy.ts
 *
 * Safe to run multiple times (idempotent).
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import bcrypt from "bcryptjs";

const ROOT = resolve(__dirname, "..");

async function main() {
  const url = process.env.DATABASE_URL;
  const email = (process.env.ADMIN_SEED_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "";

  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  if (!email || !password) {
    console.error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set.");
    process.exit(1);
  }

  console.log("Connecting to database ...");
  const sql = postgres(url, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  // ── 1. Schema ──────────────────────────────────────────
  const schemaSql = readFileSync(resolve(ROOT, "db/schema.sql"), "utf8");
  console.log("▸ Running db/schema.sql ...");
  await sql.unsafe(schemaSql);
  console.log("  ✓ Schema applied");

  // ── 2. Migrations ──────────────────────────────────────
  const migrationsDir = resolve(ROOT, "db/migrations");
  let files: string[] = [];
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    // no migrations directory
  }
  for (const file of files) {
    const sqlContent = readFileSync(resolve(migrationsDir, file), "utf8");
    console.log(`▸ Running migrations/${file} ...`);
    await sql.unsafe(sqlContent);
    console.log(`  ✓ ${file} applied`);
  }

  // ── 3. Seed admin ──────────────────────────────────────
  const hashed = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO admin_user (id, email, password, name)
    VALUES (gen_random_uuid()::text, ${email}, ${hashed}, 'Family Moderator')
    ON CONFLICT (email) DO UPDATE SET password = ${hashed}, updated_at = now()
  `;
  console.log(`▸ Admin seeded: ${email}`);

  await sql.end();
  console.log("\n✓ Database setup complete.");
}

main().catch((err) => {
  console.error("Deploy setup failed:", err);
  process.exit(1);
});
