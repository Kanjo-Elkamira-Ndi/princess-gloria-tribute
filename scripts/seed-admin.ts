/**
 * Seed the admin moderator account.
 * Idempotent — safe to run multiple times (upserts on email conflict).
 *
 * Usage:
 *   DATABASE_URL=... ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... \
 *     npx tsx scripts/seed-admin.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { loadEnv } from "./load-env";

loadEnv();

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

  const sql = postgres(url, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  // Ensure schema exists first
  const schemaSql = readFileSync(resolve(ROOT, "db/schema.sql"), "utf8");
  await sql.unsafe(schemaSql);

  const hashed = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_user (id, email, password, name)
    VALUES (gen_random_uuid()::text, ${email}, ${hashed}, 'Family Moderator')
    ON CONFLICT (email) DO UPDATE SET password = ${hashed}, updated_at = now()
  `;

  console.log(`Admin seeded: ${email}`);
  await sql.end();
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
