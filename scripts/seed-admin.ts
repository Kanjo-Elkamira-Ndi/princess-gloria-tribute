/**
 * Seed the admin moderator account from .env credentials.
 * Idempotent — safe to run multiple times.
 *
 * Usage: bun run scripts/seed-admin.ts
 */
import { sql } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "";

  if (!email || !password) {
    console.error("Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD in .env");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_user (id, email, password, name)
    VALUES (gen_random_uuid()::text, ${email}, ${hashed}, 'Family Moderator')
    ON CONFLICT (email) DO UPDATE SET password = ${hashed}
  `;

  console.log(`Admin seeded: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
