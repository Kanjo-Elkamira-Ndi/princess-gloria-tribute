import { NextResponse } from "next/server";
import {
  getAdminSession,
  approveTribute,
  rejectTribute,
  removeTribute,
  restoreTribute,
} from "@/lib/admin-tributes";
import { deleteUpload } from "@/lib/storage";
import { sql } from "@/lib/db";

/**
 * PATCH /api/admin/tributes/[id]
 *
 * Body: { action: "approve" | "reject" | "remove" | "restore" }
 *
 * Auth: requires admin session. The session user's ID is recorded as the
 * reviewer for audit purposes.
 *
 * Allowed transitions:
 *   - approve : pending  -> approved
 *   - reject  : pending  -> rejected  (uploaded photos deleted from disk)
 *   - remove  : approved -> removed   (hidden from site, photos KEPT)
 *   - restore : removed  -> approved  (back on the public wall)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing tribute id" }, { status: 400 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;
  if (
    action !== "approve" &&
    action !== "reject" &&
    action !== "remove" &&
    action !== "restore"
  ) {
    return NextResponse.json(
      { error: "Action must be 'approve', 'reject', 'remove', or 'restore'." },
      { status: 400 }
    );
  }

  const [existing] = await sql`
    SELECT id, status, photos
    FROM tribute
    WHERE id = ${id}
  `;
  if (!existing) {
    return NextResponse.json({ error: "Tribute not found" }, { status: 404 });
  }

  // Each action is only valid from a specific current status. This prevents
  // double-processing and illegal transitions (e.g. removing a pending item).
  const required: Record<string, string> = {
    approve: "pending",
    reject: "pending",
    remove: "approved",
    restore: "removed",
  };
  if (existing.status !== required[action]) {
    return NextResponse.json(
      {
        error: `This tribute is ${existing.status} and cannot be ${action}d.`,
      },
      { status: 409 }
    );
  }

  if (action === "approve") {
    await approveTribute(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  if (action === "remove") {
    // Hide from the public site but KEEP the photos so it can be restored.
    await removeTribute(id, session.user.id);
    return NextResponse.json({ ok: true, status: "removed" });
  }

  if (action === "restore") {
    await restoreTribute(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // Reject — also delete uploaded photos, since a rejected item is never restored.
  await rejectTribute(id, session.user.id);
  try {
    let photos: string[] = [];
    try {
      const parsed = JSON.parse(existing.photos);
      if (Array.isArray(parsed)) photos = parsed;
    } catch {
      photos = [];
    }
    await Promise.all(photos.map((p) => deleteUpload(p)));
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true, status: "rejected" });
}
