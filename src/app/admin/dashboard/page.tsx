import { requireAdmin, getPendingTributes, getApprovedTributesAdmin, getAdminStats } from "@/lib/admin-tributes";
import { getPendingGalleryPhotos, getApprovedGalleryPhotosAdmin, getGalleryPhotoStats } from "@/lib/admin-gallery-photos";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { AdminDashboardClient, SignOutButton } from "@/components/admin-dashboard-client";
import { format } from "date-fns";

export const metadata = {
  title: "Moderator Dashboard — Princess Gloria Mala Galabe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const [pending, approved, stats, pendingPhotos, approvedPhotos, photoStats] = await Promise.all([
    getPendingTributes(),
    getApprovedTributesAdmin(),
    getAdminStats(),
    getPendingGalleryPhotos(),
    getApprovedGalleryPhotosAdmin(),
    getGalleryPhotoStats(),
  ]);

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

  const formattedPhotos = {
    pending: pendingPhotos.map((p) => ({
      ...p,
      createdAtFormatted: format(new Date(p.createdAt), "d MMM yyyy, h:mm a"),
    })),
    approved: approvedPhotos.map((p) => ({
      ...p,
      createdAtFormatted: format(new Date(p.createdAt), "d MMM yyyy"),
      reviewedAtFormatted: p.reviewedAt
        ? format(new Date(p.reviewedAt), "d MMM yyyy")
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
                Review dashboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as {session.user.email}
              </p>
            </div>
            <SignOutButton />
          </header>

          <EternalLightDivider />

          {/* Tribute Stats */}
          <div className="mb-2">
            <h2 className="font-serif text-lg text-plum mb-3">Tributes</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            <Stat label="Pending" value={stats.pending} tone="pending" />
            <Stat label="Approved" value={stats.approved} tone="approved" />
            <Stat label="Rejected" value={stats.rejected} tone="rejected" />
          </div>

          {/* Gallery Photo Stats */}
          <div className="mb-2">
            <h2 className="font-serif text-lg text-plum mb-3">Gallery Photos</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            <Stat label="Pending" value={photoStats.pending} tone="pending" />
            <Stat label="Approved" value={photoStats.approved} tone="approved" />
            <Stat label="Rejected" value={photoStats.rejected} tone="rejected" />
          </div>

          <AdminDashboardClient
            pending={formatted.pending}
            approved={formatted.approved}
            galleryPending={formattedPhotos.pending}
            galleryApproved={formattedPhotos.approved}
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
