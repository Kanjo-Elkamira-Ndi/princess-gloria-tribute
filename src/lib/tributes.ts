import { sql } from "@/lib/db";

/**
 * Tribute data-access layer.
 *
 * CRITICAL INVARIANT: every public-facing query in this file filters on
 * `status = 'approved'`. Pending and rejected tributes are NEVER returned by
 * any function here — they are reachable only through admin-authenticated
 * queries in src/lib/admin-tributes.ts. This is the single chokepoint that
 * enforces the server-side moderation rule.
 */

export type PublicTribute = {
  id: string;
  name: string;
  relationship: string;
  message: string;
  photos: string[];
  createdAt: string; // ISO
};

function toPublic(row: {
  id: string;
  name: string;
  relationship: string;
  message: string;
  photos: string;
  created_at: string;
}): PublicTribute {
  let photos: string[] = [];
  try {
    const parsed = JSON.parse(row.photos);
    if (Array.isArray(parsed)) photos = parsed.filter((p): p is string => typeof p === "string");
  } catch {
    photos = [];
  }
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    message: row.message,
    photos,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Public list — APPROVED ONLY, newest first. This is the only function the
 * public tributes wall and the public API route ever call.
 */
export async function getApprovedTributes(): Promise<PublicTribute[]> {
  const rows = await sql`
    SELECT id, name, relationship, message, photos, created_at
    FROM tribute
    WHERE status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
  `;
  return rows.map(toPublic);
}

/**
 * Public count — APPROVED ONLY. Used on the landing page.
 */
export async function getApprovedTributeCount(): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM tribute
    WHERE status = 'approved'
  `;
  return row.count;
}

export type NewTributeInput = {
  name: string;
  relationship: string;
  message: string;
  email?: string;
  photos: string[];
  company?: string; // honeypot — silently dropped if filled
};

/**
 * Create a new tribute. Always inserted with status "pending".
 * Never returns the row ID to the client (only a generic confirmation).
 */
export async function createPendingTribute(input: NewTributeInput): Promise<void> {
  await sql`
    INSERT INTO tribute (id, name, relationship, message, email, photos, status, company)
    VALUES (
      gen_random_uuid()::text,
      ${input.name},
      ${input.relationship},
      ${input.message},
      ${input.email ?? null},
      ${JSON.stringify(input.photos)},
      'pending',
      ${input.company ?? null}
    )
  `;
}
