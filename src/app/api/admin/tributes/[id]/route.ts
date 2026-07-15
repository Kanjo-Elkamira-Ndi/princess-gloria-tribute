import { NextResponse } from "next/server";
import {
  getAdminSession,
  approveTribute,
  rejectTribute,
} from "@/lib/admin-tributes";
import { deleteUpload } from "@/lib/storage";
import { sql } from "@/lib/db";

/**
 * PATCH /api/admin/tributes/[id]
 *
 * Body: { action: "approve" | "reject" }
 *
 * Auth: requires admin session. The session user's ID is recorded as the
 * reviewer for audit purposes.
 *
 * On reject, the uploaded photos are also deleted from disk so we don't
 * keep unwanted images. The DB row is kept (status="rejected") for audit
 * but is never reachable through any public route or API.
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
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "Action must be 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  // Verify the tribute exists and is currently pending — prevents
  // re-approving already-approved items or un-rejecting rejected ones.
  const [existing] = await sql`
    SELECT id, status, photos
    FROM tribute
    WHERE id = ${id}
  `;
  if (!existing) {
    return NextResponse.json({ error: "Tribute not found" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      {
        error: `This tribute has already been ${existing.status}.`,
      },
      { status: 409 }
    );
  }

  if (action === "approve") {
    await approveTribute(id, session.user.id);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // Reject — also delete uploaded photos
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
