import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-tributes";
import {
  approveGalleryPhoto,
  rejectGalleryPhoto,
  removeGalleryPhoto,
  restoreGalleryPhoto,
} from "@/lib/admin-gallery-photos";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { sql } from "@/lib/db";

/**
 * PATCH /api/admin/gallery-photos/[id]
 *
 * Body: { action: "approve" | "reject" | "remove" | "restore" }
 *
 * Auth: requires admin session.
 *
 * Allowed transitions:
 *   - approve : pending  -> approved
 *   - reject  : pending  -> rejected  (file deleted from Cloudinary)
 *   - remove  : approved -> removed   (hidden from gallery, file KEPT)
 *   - restore : removed  -> approved
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
    return NextResponse.json({ error: "Missing photo id" }, { status: 400 });
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
    SELECT id, status, photo_url
    FROM gallery_photo
    WHERE id = ${id}
  `;
  if (!existing) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const required: Record<string, string> = {
    approve: "pending",
    reject: "pending",
    remove: "approved",
    restore: "removed",
  };
  if (existing.status !== required[action]) {
    return NextResponse.json(
      { error: `This photo is ${existing.status} and cannot be ${action}d.` },
      { status: 409 }
    );
  }

  if (action === "approve") {
    await approveGalleryPhoto(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  if (action === "remove") {
    // Hide from the public gallery but KEEP the file so it can be restored.
    await removeGalleryPhoto(id, session.user.id);
    return NextResponse.json({ ok: true, status: "removed" });
  }

  if (action === "restore") {
    await restoreGalleryPhoto(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // Reject — also delete the uploaded photo from Cloudinary
  await rejectGalleryPhoto(id, session.user.id);
  try {
    await deleteFromCloudinary(existing.photo_url);
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true, status: "rejected" });
}
