import { NextResponse } from "next/server";
import {
  getAdminSession,
  getPendingTributes,
  getApprovedTributesAdmin,
  getAdminStats,
} from "@/lib/admin-tributes";

/**
 * GET /api/admin/tributes
 *
 * Returns:
 *  - ?status=pending  → pending queue (default)
 *  - ?status=approved → approved list with private email field
 *
 * Auth: requires admin session. Unauthenticated → 401.
 * This route is the ONLY way to reach pending or rejected tributes.
 */
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get("status") ?? "pending";

  if (filter === "approved") {
    const [tributes, stats] = await Promise.all([
      getApprovedTributesAdmin(),
      getAdminStats(),
    ]);
    return NextResponse.json({ tributes, stats });
  }

  // Default: pending queue
  const [tributes, stats] = await Promise.all([
    getPendingTributes(),
    getAdminStats(),
  ]);
  return NextResponse.json({ tributes, stats });
}
