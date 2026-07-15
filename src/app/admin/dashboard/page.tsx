import { requireAdmin, getPendingTributes, getApprovedTributesAdmin, getAdminStats } from "@/lib/admin-tributes";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { AdminDashboardClient, SignOutButton } from "@/components/admin-dashboard-client";
import { format } from "date-fns";

export const metadata = {
  title: "Moderator Dashboard — Princess Gloria Mala Galabe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const [pending, approved, stats] = await Promise.all([
    getPendingTributes(),
    getApprovedTributesAdmin(),
    getAdminStats(),
  ]);

  // Format dates for the client — server-side to avoid timezone drift
  const formatted = {
    pending: pending.map((t) => ({
      ...t,
      createdAtFormatted: format(new Date(t.createdAt), "d MMM yyyy, h:mm a"),
    })),
    approved: approved.map((t) => ({
      ...t,
      createdAtFormatted: format(new Date(t.createdAt), "d MMM yyyy"),
      reviewedAtFormatted: t.reviewedAt
        ? format(new Date(t.reviewedAt), "d MMM yyyy")
        : "",
    })),
  };

  return (
    <PageShell>
      <section className="px-5 sm:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
                Family Moderator
              </p>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl text-plum">
                Tribute review
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as {session.user.email}
              </p>
            </div>
            <SignOutButton />
          </header>

          <EternalLightDivider />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            <Stat label="Pending" value={stats.pending} tone="pending" />
            <Stat label="Approved" value={stats.approved} tone="approved" />
            <Stat label="Rejected" value={stats.rejected} tone="rejected" />
          </div>

          <AdminDashboardClient
            pending={formatted.pending}
            approved={formatted.approved}
          />
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "pending" | "approved" | "rejected";
}) {
  const toneClass = {
    pending: "text-plum",
    approved: "text-plum/80",
    rejected: "text-muted-foreground",
  }[tone];

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 text-center">
      <p className={`font-serif text-3xl sm:text-4xl ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
