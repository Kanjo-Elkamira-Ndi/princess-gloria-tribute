import { NextResponse } from "next/server";
import {
  getAdminSession,
  approveGalleryPhoto,
  rejectGalleryPhoto,
} from "@/lib/admin-gallery-photos";
import { deleteUpload } from "@/lib/storage";
import { sql } from "@/lib/db";

/**
 * PATCH /api/admin/gallery-photos/[id]
 *
 * Body: { action: "approve" | "reject" }
 *
 * Auth: requires admin session.
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
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "Action must be 'approve' or 'reject'." },
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
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: `This photo has already been ${existing.status}.` },
      { status: 409 }
    );
  }

  if (action === "approve") {
    await approveGalleryPhoto(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // Reject — also delete the uploaded photo
  await rejectGalleryPhoto(id, session.user.id);
  try {
    await deleteUpload(existing.photo_url);
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true, status: "rejected" });
}
