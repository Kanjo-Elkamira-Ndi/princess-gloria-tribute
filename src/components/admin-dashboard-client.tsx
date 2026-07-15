"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, LogOut, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Tribute = {
  id: string;
  name: string;
  relationship: string;
  message: string;
  email: string | null;
  photos: string[];
  status: string;
  createdAtFormatted: string;
  reviewedAtFormatted?: string;
};

type GalleryPhoto = {
  id: string;
  name: string;
  email: string | null;
  photoUrl: string;
  caption: string | null;
  status: string;
  createdAtFormatted: string;
  reviewedAtFormatted?: string;
};

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-lavender/60 transition-colors min-h-[44px]"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      Sign out
    </button>
  );
}

export function AdminDashboardClient({
  pending,
  approved,
  galleryPending = [],
  galleryApproved = [],
}: {
  pending: Tribute[];
  approved: Tribute[];
  galleryPending?: GalleryPhoto[];
  galleryApproved?: GalleryPhoto[];
}) {
  const router = useRouter();
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function actTribute(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/tributes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "That didn't work. Please try again.");
        return;
      }

      toast.success(
        action === "approve"
          ? "Tribute approved \u2014 it is now visible on the wall."
          : "Tribute declined. It will not appear publicly."
      );
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("We couldn\u2019t reach the server. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  async function actGalleryPhoto(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/gallery-photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "That didn't work. Please try again.");
        return;
      }

      toast.success(
        action === "approve"
          ? "Photo approved \u2014 it is now visible in the gallery."
          : "Photo declined. It will not appear publicly."
      );
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("We couldn\u2019t reach the server. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      {/* Tributes Section */}
      <TributeList
        pending={pending}
        approved={approved}
        onAct={actTribute}
        actingId={actingId}
      />

      {/* Gallery Photos Section */}
      {galleryPending.length > 0 || galleryApproved.length > 0 ? (
        <GalleryPhotoList
          pending={galleryPending}
          approved={galleryApproved}
          onAct={actGalleryPhoto}
          actingId={actingId}
        />
      ) : null}
    </div>
  );
}

function TributeList({
  pending,
  approved,
  onAct,
  actingId,
}: {
  pending: Tribute[];
  approved: Tribute[];
  onAct: (id: string, action: "approve" | "reject") => void;
  actingId: string | null;
}) {
  const [tab, setTab] = useState<"pending" | "approved">(
    pending.length > 0 ? "pending" : "approved"
  );

  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tribute list filter"
        className="inline-flex rounded-lg border border-border bg-lavender/40 p-1 mb-8"
      >
        <button
          role="tab"
          aria-selected={tab === "pending"}
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
            tab === "pending"
              ? "bg-plum text-warm-white"
              : "text-foreground hover:bg-lavender"
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "approved"}
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
            tab === "approved"
              ? "bg-plum text-warm-white"
              : "text-foreground hover:bg-lavender"
          }`}
        >
          Approved ({approved.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border/60">
          <p className="font-serif italic text-plum">
            {tab === "pending"
              ? "No tributes are waiting for review."
              : "No tributes have been approved yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((t) => (
            <li key={t.id}>
              <article className="rounded-2xl bg-card border border-border/60 p-5 sm:p-6">
                <div className="flex flex-col md:flex-row gap-5">
                  {t.photos.length > 0 && (
                    <div className="flex md:flex-col gap-2 md:w-40 shrink-0">
                      {t.photos.slice(0, 3).map((src, idx) => (
                        <img
                          key={src + idx}
                          src={src}
                          alt={`Photo ${idx + 1} shared by ${t.name}`}
                          className="w-20 h-20 md:w-full md:h-32 object-cover rounded-lg border border-border"
                          loading="lazy"
                        />
                      ))}
                      {t.photos.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center md:self-start">
                          + {t.photos.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="font-serif text-lg text-plum">{t.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.relationship}
                      </p>
                    </div>
                    <p className="mt-2 text-foreground/85 whitespace-pre-wrap leading-relaxed">
                      {t.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Submitted: {t.createdAtFormatted}</span>
                      {t.email && <span>Email: {t.email}</span>}
                      {t.reviewedAtFormatted && (
                        <span>Reviewed: {t.reviewedAtFormatted}</span>
                      )}
                    </div>

                    {tab === "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => onAct(t.id, "approve")}
                          disabled={actingId === t.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-plum text-warm-white text-sm hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-60"
                        >
                          {actingId === t.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Check className="w-4 h-4" aria-hidden="true" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onAct(t.id, "reject")}
                          disabled={actingId === t.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-lavender/60 transition-colors min-h-[44px] disabled:opacity-60"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryPhotoList({
  pending,
  approved,
  onAct,
  actingId,
}: {
  pending: GalleryPhoto[];
  approved: GalleryPhoto[];
  onAct: (id: string, action: "approve" | "reject") => void;
  actingId: string | null;
}) {
  const [tab, setTab] = useState<"pending" | "approved">(
    pending.length > 0 ? "pending" : "approved"
  );

  const list = tab === "pending" ? pending : approved;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon className="w-5 h-5 text-plum" aria-hidden="true" />
        <h3 className="font-serif text-lg text-plum">Gallery Photos</h3>
      </div>

      <div
        role="tablist"
        aria-label="Gallery photo list filter"
        className="inline-flex rounded-lg border border-border bg-lavender/40 p-1 mb-8"
      >
        <button
          role="tab"
          aria-selected={tab === "pending"}
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
            tab === "pending"
              ? "bg-plum text-warm-white"
              : "text-foreground hover:bg-lavender"
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "approved"}
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
            tab === "approved"
              ? "bg-plum text-warm-white"
              : "text-foreground hover:bg-lavender"
          }`}
        >
          Approved ({approved.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border/60">
          <p className="font-serif italic text-plum">
            {tab === "pending"
              ? "No gallery photos are waiting for review."
              : "No gallery photos have been approved yet."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <li key={p.id}>
              <article className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <img
                    src={p.photoUrl}
                    alt={p.caption || `Photo shared by ${p.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="font-sans text-sm font-medium text-foreground">
                    {p.name}
                  </p>
                  {p.caption && (
                    <p className="mt-1 text-sm text-foreground/75 italic">
                      {p.caption}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span>{p.createdAtFormatted}</span>
                    {p.email && <span>{p.email}</span>}
                  </div>

                  {tab === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onAct(p.id, "approve")}
                        disabled={actingId === p.id}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-plum text-warm-white text-xs hover:opacity-90 transition-opacity min-h-[36px] disabled:opacity-60"
                      >
                        {actingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onAct(p.id, "reject")}
                        disabled={actingId === p.id}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-lavender/60 transition-colors min-h-[36px] disabled:opacity-60"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
