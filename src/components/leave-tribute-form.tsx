"use client";

import { useState, useRef, useTransition } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_MESSAGE = 4000;

type Preview = { file: File; url: string };

export function LeaveTributeForm() {
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onPickPhotos(files: FileList | null) {
    if (!files) return;
    setError(null);
    const incoming = Array.from(files).filter(
      (f) => f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/webp"
    );
    if (incoming.length !== Array.from(files).length) {
      setError("Photos must be in JPEG, PNG, or WebP format.");
    }
    const tooBig = incoming.find((f) => f.size > MAX_PHOTO_BYTES);
    if (tooBig) {
      setError("Each photo must be 5 MB or smaller.");
      return;
    }
    const room = MAX_PHOTOS - previews.length;
    const accepted = incoming.slice(0, room);
    if (incoming.length > room) {
      setError(`You can add up to ${MAX_PHOTOS} photos in total.`);
    }
    const newPreviews = accepted.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please add your name so we know who is sharing.");
      return;
    }
    if (!relationship.trim()) {
      setError("Please tell us your relationship to her.");
      return;
    }
    if (!message.trim()) {
      setError("Please write a short message before submitting.");
      return;
    }
    if (message.length > MAX_MESSAGE) {
      setError(`Please keep your message under ${MAX_MESSAGE.toLocaleString()} characters.`);
      return;
    }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("relationship", relationship.trim());
    fd.set("message", message.trim());
    if (email.trim()) fd.set("email", email.trim());
    if (company) fd.set("company", company);
    for (const p of previews) fd.append("photos", p.file);

    startTransition(async () => {
      try {
        const res = await fetch("/api/tributes", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error ?? "Something went wrong. Please try again.");
          return;
        }

        for (const p of previews) URL.revokeObjectURL(p.url);
        setPreviews([]);
        setSuccess(true);
      } catch {
        setError("We couldn\u2019t reach the server. Please try again in a moment.");
      }
    });
  }

  if (success) {
    return (
      <div className="text-center py-10 px-4">
        <div className="mx-auto max-w-md rounded-2xl bg-card border border-border/60 p-8">
          <p className="font-serif text-xl text-plum italic">Thank you.</p>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Your tribute has been received and is pending review. Once a family
            moderator has read it, it will appear on the tributes wall.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Your kindness is a comfort to us.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setName("");
            setRelationship("");
            setMessage("");
            setEmail("");
          }}
          className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
        >
          Share another tribute
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-left" noValidate>
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label htmlFor="lp-company">Company (leave empty)</label>
        <input
          id="lp-company"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <Field id="lp-name" label="Your name" required>
        <input id="lp-name" type="text" value={name}
          onChange={(e) => setName(e.target.value)} maxLength={120}
          required autoComplete="name"
          className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
          placeholder="e.g. Marceline Angafor" />
      </Field>

      <Field id="lp-relationship" label="Your relationship to her" required
        hint="daughter, niece, friend, colleague, neighbour...">
        <input id="lp-relationship" type="text" value={relationship}
          onChange={(e) => setRelationship(e.target.value)} maxLength={120}
          required
          className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
          placeholder="e.g. Niece" />
      </Field>

      <Field id="lp-message" label="Your tribute" required
        hint={`Up to ${MAX_MESSAGE.toLocaleString()} characters.`}>
        <textarea id="lp-message" value={message}
          onChange={(e) => setMessage(e.target.value)} maxLength={MAX_MESSAGE}
          required rows={5}
          className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum resize-y min-h-[120px]"
          placeholder="Share a memory, a thank-you, or a few words about how she touched your life..." />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {message.length.toLocaleString()} / {MAX_MESSAGE.toLocaleString()}
        </div>
      </Field>

      <Field id="lp-photos" label="Photos (optional)"
        hint={`Up to ${MAX_PHOTOS} photos, JPEG / PNG / WebP, 5 MB each.`}>
        <div className="flex flex-wrap gap-3">
          {previews.map((p, idx) => (
            <div key={p.url}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-lavender/50">
              <img src={p.url} alt={`Selected photo ${idx + 1}`}
                className="w-full h-full object-cover" />
              <button type="button" onClick={() => removePhoto(idx)}
                aria-label={`Remove photo ${idx + 1}`}
                className="absolute top-1 right-1 rounded-full bg-plum/80 hover:bg-plum text-warm-white p-1 transition-colors">
                <X className="w-3 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {previews.length < MAX_PHOTOS && (
            <button type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border border-dashed border-border bg-lavender/30 hover:bg-lavender/60 transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-plum"
              aria-label="Add a photo">
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] mt-1">Add</span>
            </button>
          )}
          <input ref={fileInputRef} id="lp-photos" type="file"
            accept="image/jpeg,image/png,image/webp" multiple
            onChange={(e) => onPickPhotos(e.target.files)} className="sr-only" />
        </div>
      </Field>

      <Field id="lp-email" label="Email (optional, private)">
        <input id="lp-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} maxLength={254}
          autoComplete="email"
          className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
          placeholder="you@example.com" />
      </Field>

      {error && (
        <div role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="pt-2 text-center">
        <button type="submit" disabled={pending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed">
          {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {pending ? "Sending\u2026" : "Share tribute"}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, hint, required, children }: {
  id: string; label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-sm font-medium text-plum mb-1.5">
        {label}
        {required && <span className="text-muted-foreground ml-1" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      {children}
    </div>
  );
}
