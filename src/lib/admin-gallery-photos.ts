import { sql } from "@/lib/db";

/**
 * Admin gallery photo data-access layer.
 *
 * Requires an authenticated admin session. Only used in admin API routes.
 */

export type AdminGalleryPhoto = {
  id: string;
  name: string;
  email: string | null;
  photoUrl: string;
  caption: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
};

function toAdmin(row: {
  id: string;
  name: string;
  email: string | null;
  photo_url: string;
  caption: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}): AdminGalleryPhoto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photo_url,
    caption: row.caption,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
  };
}

export async function getPendingGalleryPhotos(): Promise<AdminGalleryPhoto[]> {
  const rows = await sql`
    SELECT id, name, email, photo_url, caption, status, created_at, reviewed_at
    FROM gallery_photo
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  return rows.map(toAdmin);
}

export async function getApprovedGalleryPhotosAdmin(): Promise<AdminGalleryPhoto[]> {
  const rows = await sql`
    SELECT id, name, email, photo_url, caption, status, created_at, reviewed_at
    FROM gallery_photo
    WHERE status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
  `;
  return rows.map(toAdmin);
}

/**
 * List gallery photos removed from the public site. Kept (with their files)
 * so the removal can be undone via restoreGalleryPhoto().
 */
export async function getRemovedGalleryPhotosAdmin(): Promise<AdminGalleryPhoto[]> {
  const rows = await sql`
    SELECT id, name, email, photo_url, caption, status, created_at, reviewed_at
    FROM gallery_photo
    WHERE status = 'removed'
    ORDER BY reviewed_at DESC NULLS LAST
  `;
  return rows.map(toAdmin);
}

export async function approveGalleryPhoto(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE gallery_photo
    SET status = 'approved', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

export async function rejectGalleryPhoto(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE gallery_photo
    SET status = 'rejected', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

/**
 * Remove a previously-approved photo from the public gallery. The file is KEPT
 * so the action can be undone via restoreGalleryPhoto().
 */
export async function removeGalleryPhoto(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE gallery_photo
    SET status = 'removed', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

/**
 * Restore a removed photo back to the public gallery.
 */
export async function restoreGalleryPhoto(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE gallery_photo
    SET status = 'approved', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

export async function getGalleryPhotoStats() {
  const [pending, approved, rejected, removed] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM gallery_photo WHERE status = 'pending'`,
    sql`SELECT COUNT(*)::int AS count FROM gallery_photo WHERE status = 'approved'`,
    sql`SELECT COUNT(*)::int AS count FROM gallery_photo WHERE status = 'rejected'`,
    sql`SELECT COUNT(*)::int AS count FROM gallery_photo WHERE status = 'removed'`,
  ]);
  return {
    pending: pending[0].count,
    approved: approved[0].count,
    rejected: rejected[0].count,
    removed: removed[0].count,
  };
}
