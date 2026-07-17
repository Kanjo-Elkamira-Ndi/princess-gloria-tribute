"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, LogOut, Trash2, RotateCcw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type TributeAction = "approve" | "reject" | "remove" | "restore";

type Tribute = {
  id: string;
  name: string;
  relationship: string;
  message: string;
  email: string | null;
  phone: string | null;
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

type Tab = "pending" | "approved" | "removed";

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
  removed = [],
  galleryPending = [],
  galleryApproved = [],
  galleryRemoved = [],
}: {
  pending: Tribute[];
  approved: Tribute[];
  removed?: Tribute[];
  galleryPending?: GalleryPhoto[];
  galleryApproved?: GalleryPhoto[];
  galleryRemoved?: GalleryPhoto[];
}) {
  const router = useRouter();
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function act(
    kind: "tributes" | "gallery-photos",
    id: string,
    action: TributeAction
  ) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/${kind}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "That didn't work. Please try again.");
        return;
      }

      const noun = kind === "tributes" ? "Tribute" : "Photo";
      const where = kind === "tributes" ? "the wall" : "the gallery";
      const messages: Record<TributeAction, string> = {
        approve: `${noun} approved — it is now visible on ${where}.`,
        reject: `${noun} declined. It will not appear publicly.`,
        remove: `${noun} removed from ${where}. You can restore it anytime.`,
        restore: `${noun} restored — it is visible on ${where} again.`,
      };
      toast.success(messages[action]);
      startTransition(() => router.refresh());
    } catch {
      toast.error("We couldn’t reach the server. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-14">
      <TributeTable
        pending={pending}
        approved={approved}
        removed={removed}
        onAct={(id, action) => act("tributes", id, action)}
        actingId={actingId}
      />

      <GalleryTable
        pending={galleryPending}
        approved={galleryApproved}
        removed={galleryRemoved}
        onAct={(id, action) => act("gallery-photos", id, action)}
        actingId={actingId}
      />
    </div>
  );
}

function Tabs({
  tab,
  setTab,
  counts,
  label,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  counts: Record<Tab, number>;
  label: string;
}) {
  const items: { key: Tab; text: string }[] = [
    { key: "pending", text: `Pending (${counts.pending})` },
    { key: "approved", text: `Approved (${counts.approved})` },
    { key: "removed", text: `Removed (${counts.removed})` },
  ];
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-lg border border-border bg-lavender/40 p-1 mb-6"
    >
      {items.map((it) => (
        <button
          key={it.key}
          role="tab"
          aria-selected={tab === it.key}
          onClick={() => setTab(it.key)}
          className={`px-4 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
            tab === it.key
              ? "bg-plum text-warm-white"
              : "text-foreground hover:bg-lavender"
          }`}
        >
          {it.text}
        </button>
      ))}
    </div>
  );
}

function ActionButtons({
  status,
  id,
  onAct,
  actingId,
}: {
  status: Tab;
  id: string;
  onAct: (id: string, action: TributeAction) => void;
  actingId: string | null;
}) {
  const busy = actingId === id;
  const spinner = <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />;

  if (status === "pending") {
    return (
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => onAct(id, "approve")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-plum text-warm-white text-xs hover:opacity-90 transition-opacity min-h-[36px] disabled:opacity-60"
        >
          {busy ? spinner : <Check className="w-4 h-4" aria-hidden="true" />}
          Approve
        </button>
        <button
          type="button"
          onClick={() => onAct(id, "reject")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-lavender/60 transition-colors min-h-[36px] disabled:opacity-60"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Decline
        </button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onAct(id, "remove")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/50 text-xs text-destructive hover:bg-destructive/5 transition-colors min-h-[36px] disabled:opacity-60"
        >
          {busy ? spinner : <Trash2 className="w-4 h-4" aria-hidden="true" />}
          Remove
        </button>
      </div>
    );
  }

  // removed
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => onAct(id, "restore")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-plum text-warm-white text-xs hover:opacity-90 transition-opacity min-h-[36px] disabled:opacity-60"
      >
        {busy ? spinner : <RotateCcw className="w-4 h-4" aria-hidden="true" />}
        Restore
      </button>
    </div>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        <p className="font-serif italic text-plum">{text}</p>
      </td>
    </tr>
  );
}

function TributeTable({
  pending,
  approved,
  removed,
  onAct,
  actingId,
}: {
  pending: Tribute[];
  approved: Tribute[];
  removed: Tribute[];
  onAct: (id: string, action: TributeAction) => void;
  actingId: string | null;
}) {
  const [tab, setTab] = useState<Tab>(pending.length > 0 ? "pending" : "approved");
  const list = tab === "pending" ? pending : tab === "approved" ? approved : removed;

  const emptyText =
    tab === "pending"
      ? "No tributes are waiting for review."
      : tab === "approved"
      ? "No tributes are live on the wall."
      : "No tributes have been removed.";

  return (
    <div>
      <h2 className="font-serif text-lg text-plum mb-4">Tributes</h2>
      <Tabs
        tab={tab}
        setTab={setTab}
        counts={{ pending: pending.length, approved: approved.length, removed: removed.length }}
        label="Tribute list filter"
      />

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Photos</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Submitted</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {list.length === 0 ? (
              <EmptyRow colSpan={6} text={emptyText} />
            ) : (
              list.map((t) => (
                <tr key={t.id} className="align-top">
                  <td className="px-4 py-4">
                    {t.photos.length > 0 ? (
                      <div className="flex gap-1.5">
                        {t.photos.slice(0, 2).map((src, idx) => (
                          <img
                            key={src + idx}
                            src={src}
                            alt={`Photo ${idx + 1} from ${t.name}`}
                            className="w-12 h-12 object-cover rounded-md border border-border"
                            loading="lazy"
                          />
                        ))}
                        {t.photos.length > 2 && (
                          <span className="self-center text-xs text-muted-foreground">
                            +{t.photos.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 min-w-[8rem]">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.relationship}</p>
                  </td>
                  <td className="px-4 py-4 max-w-[22rem]">
                    <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {t.message}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground min-w-[10rem]">
                    {t.email && <div className="break-all">{t.email}</div>}
                    {t.phone && <div className="break-all">{t.phone}</div>}
                    {!t.email && !t.phone && <span>—</span>}
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                    <div>{t.createdAtFormatted}</div>
                    {t.reviewedAtFormatted && (
                      <div className="mt-0.5">Reviewed: {t.reviewedAtFormatted}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ActionButtons status={tab} id={t.id} onAct={onAct} actingId={actingId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GalleryTable({
  pending,
  approved,
  removed,
  onAct,
  actingId,
}: {
  pending: GalleryPhoto[];
  approved: GalleryPhoto[];
  removed: GalleryPhoto[];
  onAct: (id: string, action: TributeAction) => void;
  actingId: string | null;
}) {
  const [tab, setTab] = useState<Tab>(pending.length > 0 ? "pending" : "approved");
  const list = tab === "pending" ? pending : tab === "approved" ? approved : removed;

  const emptyText =
    tab === "pending"
      ? "No gallery photos are waiting for review."
      : tab === "approved"
      ? "No gallery photos are live."
      : "No gallery photos have been removed.";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon className="w-5 h-5 text-plum" aria-hidden="true" />
        <h2 className="font-serif text-lg text-plum">Gallery Photos</h2>
      </div>
      <Tabs
        tab={tab}
        setTab={setTab}
        counts={{ pending: pending.length, approved: approved.length, removed: removed.length }}
        label="Gallery photo list filter"
      />

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Caption</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Submitted</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {list.length === 0 ? (
              <EmptyRow colSpan={6} text={emptyText} />
            ) : (
              list.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-4">
                    <img
                      src={p.photoUrl}
                      alt={p.caption || `Photo from ${p.name}`}
                      className="w-16 h-16 object-cover rounded-md border border-border"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-4 min-w-[8rem]">
                    <p className="font-medium text-foreground">{p.name}</p>
                  </td>
                  <td className="px-4 py-4 max-w-[22rem]">
                    {p.caption ? (
                      <p className="text-foreground/85 italic line-clamp-3">{p.caption}</p>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground min-w-[10rem]">
                    {p.email ? <span className="break-all">{p.email}</span> : <span>—</span>}
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                    <div>{p.createdAtFormatted}</div>
                    {p.reviewedAtFormatted && (
                      <div className="mt-0.5">Reviewed: {p.reviewedAtFormatted}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ActionButtons status={tab} id={p.id} onAct={onAct} actingId={actingId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
