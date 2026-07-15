"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, LogOut } from "lucide-react";
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
}: {
  pending: Tribute[];
  approved: Tribute[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved">(
    pending.length > 0 ? "pending" : "approved"
  );
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function act(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/tributes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "That didn’t work. Please try again.");
        return;
      }

      toast.success(
        action === "approve"
          ? "Tribute approved — it is now visible on the wall."
          : "Tribute declined. It will not appear publicly."
      );
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("We couldn’t reach the server. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      {/* Tab switch */}
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
                  {/* Photos */}
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

                  {/* Content */}
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
                          onClick={() => act(t.id, "approve")}
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
                          onClick={() => act(t.id, "reject")}
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
