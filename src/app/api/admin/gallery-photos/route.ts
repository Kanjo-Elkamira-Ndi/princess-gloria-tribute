import { NextResponse } from "next/server";
import {
  getAdminSession,
  getPendingGalleryPhotos,
  getApprovedGalleryPhotosAdmin,
  getGalleryPhotoStats,
} from "@/lib/admin-gallery-photos";

/**
 * GET /api/admin/gallery-photos
 *
 * Auth: requires admin session.
 */
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get("status") ?? "pending";

  if (filter === "approved") {
    const [photos, stats] = await Promise.all([
      getApprovedGalleryPhotosAdmin(),
      getGalleryPhotoStats(),
    ]);
    return NextResponse.json({ photos, stats });
  }

  const [photos, stats] = await Promise.all([
    getPendingGalleryPhotos(),
    getGalleryPhotoStats(),
  ]);
  return NextResponse.json({ photos, stats });
}
