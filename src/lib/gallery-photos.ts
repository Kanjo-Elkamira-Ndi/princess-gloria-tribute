import { sql } from "@/lib/db";

/**
 * Gallery photo data-access layer.
 *
 * Same moderation model as tributes: public-facing queries only return
 * approved photos. Pending/rejected are only reachable through admin routes.
 */

export type PublicGalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  submitterName: string;
  createdAt: string;
};

function toPublic(row: {
  id: string;
  photo_url: string;
  caption: string | null;
  name: string;
  created_at: string;
}): PublicGalleryPhoto {
  return {
    id: row.id,
    src: row.photo_url,
    alt: row.caption || `A photo shared in memory of Princess Gloria`,
    caption: row.caption,
    submitterName: row.name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Public list — APPROVED ONLY, newest first.
 */
export async function getApprovedGalleryPhotos(): Promise<PublicGalleryPhoto[]> {
  const rows = await sql`
    SELECT id, photo_url, caption, name, created_at
    FROM gallery_photo
    WHERE status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
  `;
  return rows.map(toPublic);
}

/**
 * Public count — APPROVED ONLY.
 */
export async function getApprovedGalleryPhotoCount(): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM gallery_photo
    WHERE status = 'approved'
  `;
  return row.count;
}

export type NewGalleryPhotoInput = {
  name: string;
  email?: string;
  photoUrl: string;
  caption?: string;
  company?: string;
};

/**
 * Create a new gallery photo. Always inserted with status "pending".
 */
export async function createPendingGalleryPhoto(input: NewGalleryPhotoInput): Promise<void> {
  await sql`
    INSERT INTO gallery_photo (id, name, email, photo_url, caption, status, company)
    VALUES (
      gen_random_uuid()::text,
      ${input.name},
      ${input.email ?? null},
      ${input.photoUrl},
      ${input.caption ?? null},
      'pending',
      ${input.company ?? null}
    )
  `;
}
