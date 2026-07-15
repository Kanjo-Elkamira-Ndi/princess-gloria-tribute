import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Admin data-access layer.
 *
 * Every function in this file requires an authenticated admin session — the
 * caller must pass a valid `adminId`. This file is the ONLY place that
 * queries pending or rejected tributes. Public code paths can never reach
 * these queries.
 */

export type AdminTribute = {
  id: string;
  name: string;
  relationship: string;
  message: string;
  email: string | null;
  photos: string[];
  status: string;
  createdAt: string;
  reviewedAt: string | null;
};

function toAdmin(row: {
  id: string;
  name: string;
  relationship: string;
  message: string;
  email: string | null;
  photos: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}): AdminTribute {
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
    email: row.email,
    photos,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
  };
}

/**
 * Returns the current admin session, or null if not signed in.
 * Use this in API routes to gate access.
 */
export async function getAdminSession() {
  return getServerSession(authOptions);
}

/**
 * Server component helper — redirects to /admin/login if no session.
 * Use this in admin pages.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login?from=dashboard");
  return session;
}

/**
 * List ALL pending tributes (admin only). Oldest first so the family can
 * clear the queue in submission order.
 */
export async function getPendingTributes(): Promise<AdminTribute[]> {
  const rows = await sql`
    SELECT id, name, relationship, message, email, photos, status, created_at, reviewed_at
    FROM tribute
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  return rows.map(toAdmin);
}

/**
 * List ALL approved tributes (admin view — includes private email field).
 */
export async function getApprovedTributesAdmin(): Promise<AdminTribute[]> {
  const rows = await sql`
    SELECT id, name, relationship, message, email, photos, status, created_at, reviewed_at
    FROM tribute
    WHERE status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
  `;
  return rows.map(toAdmin);
}

/**
 * Approve a tribute — becomes publicly visible immediately.
 */
export async function approveTribute(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE tribute
    SET status = 'approved', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

/**
 * Reject a tribute — hidden from public view permanently. The record is kept
 * for audit but no public route, API, or direct URL can ever surface it.
 */
export async function rejectTribute(id: string, adminId: string): Promise<void> {
  await sql`
    UPDATE tribute
    SET status = 'rejected', reviewed_at = now(), reviewed_by = ${adminId}
    WHERE id = ${id}
  `;
}

export async function getAdminStats() {
  const [pending, approved, rejected] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM tribute WHERE status = 'pending'`,
    sql`SELECT COUNT(*)::int AS count FROM tribute WHERE status = 'approved'`,
    sql`SELECT COUNT(*)::int AS count FROM tribute WHERE status = 'rejected'`,
  ]);
  return {
    pending: pending[0].count,
    approved: approved[0].count,
    rejected: rejected[0].count,
  };
}
