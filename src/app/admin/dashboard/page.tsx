import { requireAdmin, getPendingTributes, getApprovedTributesAdmin, getRemovedTributesAdmin, getAdminStats } from "@/lib/admin-tributes";
import { getPendingGalleryPhotos, getApprovedGalleryPhotosAdmin, getRemovedGalleryPhotosAdmin, getGalleryPhotoStats } from "@/lib/admin-gallery-photos";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { AdminDashboardClient, SignOutButton } from "@/components/admin-dashboard-client";
import { format } from "date-fns";

export const metadata = {
  title: "Moderator Dashboard — Princess Gloria Mala Galabe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const [pending, approved, removed, stats, pendingPhotos, approvedPhotos, removedPhotos, photoStats] = await Promise.all([
    getPendingTributes(),
    getApprovedTributesAdmin(),
    getRemovedTributesAdmin(),
    getAdminStats(),
    getPendingGalleryPhotos(),
    getApprovedGalleryPhotosAdmin(),
    getRemovedGalleryPhotosAdmin(),
    getGalleryPhotoStats(),
  ]);

  const fmtTribute = (t: (typeof pending)[number]) => ({
    ...t,
    createdAtFormatted: format(new Date(t.createdAt), "d MMM yyyy, h:mm a"),
    reviewedAtFormatted: t.reviewedAt
      ? format(new Date(t.reviewedAt), "d MMM yyyy")
      : "",
  });

  const fmtPhoto = (p: (typeof pendingPhotos)[number]) => ({
    ...p,
    createdAtFormatted: format(new Date(p.createdAt), "d MMM yyyy, h:mm a"),
    reviewedAtFormatted: p.reviewedAt
      ? format(new Date(p.reviewedAt), "d MMM yyyy")
      : "",
  });

  const formatted = {
    pending: pending.map(fmtTribute),
    approved: approved.map(fmtTribute),
    removed: removed.map(fmtTribute),
  };

  const formattedPhotos = {
    pending: pendingPhotos.map(fmtPhoto),
    approved: approvedPhotos.map(fmtPhoto),
    removed: removedPhotos.map(fmtPhoto),
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
            <Stat label="Pending" value={stats.pending} tone="pending" />
            <Stat label="Approved" value={stats.approved} tone="approved" />
            <Stat label="Removed" value={stats.removed} tone="rejected" />
            <Stat label="Declined" value={stats.rejected} tone="rejected" />
          </div>

          {/* Gallery Photo Stats */}
          <div className="mb-2">
            <h2 className="font-serif text-lg text-plum mb-3">Gallery Photos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
            <Stat label="Pending" value={photoStats.pending} tone="pending" />
            <Stat label="Approved" value={photoStats.approved} tone="approved" />
            <Stat label="Removed" value={photoStats.removed} tone="rejected" />
            <Stat label="Declined" value={photoStats.rejected} tone="rejected" />
          </div>

          <AdminDashboardClient
            pending={formatted.pending}
            approved={formatted.approved}
            removed={formatted.removed}
            galleryPending={formattedPhotos.pending}
            galleryApproved={formattedPhotos.approved}
            galleryRemoved={formattedPhotos.removed}
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
