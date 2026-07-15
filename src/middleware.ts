import { withAuth } from "next-auth/middleware";

/**
 * Protect admin dashboard (and any nested admin routes) at the edge.
 * Unauthenticated requests are redirected to /admin/login.
 *
 * Note: this is defense-in-depth. Every admin API route also re-checks the
 * session server-side — see src/lib/admin-tributes.ts.
 */
export default withAuth({
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
