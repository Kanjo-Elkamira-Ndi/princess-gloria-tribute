"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { Loader2, ImagePlus, X } from "lucide-react";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_CAPTION = 300;

type Preview = { file: File; url: string };

export default function SubmitGalleryPhotoPage() {
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  function onPickPhoto(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const file = files[0];

    if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp") {
      setError("Photo must be in JPEG, PNG, or WebP format.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be 5 MB or smaller.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview.url);
    setPreview({ file, url: URL.createObjectURL(file) });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto() {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please add your name so we know who is sharing.");
      return;
    }
    if (!preview) {
      setError("Please select a photo to share.");
      return;
    }
    if (caption.length > MAX_CAPTION) {
      setError(`Please keep your caption under ${MAX_CAPTION} characters.`);
      return;
    }

    const fd = new FormData();
    fd.set("name", name.trim());
    if (email.trim()) fd.set("email", email.trim());
    if (caption.trim()) fd.set("caption", caption.trim());
    const companyVal = companyRef.current?.value?.trim() ?? "";
    if (companyVal) fd.set("company", companyVal);
    fd.append("photo", preview.file);

    startTransition(async () => {
      try {
        const res = await fetch("/api/gallery-photos", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error ?? "Something went wrong. Please try again.");
          return;
        }

        if (preview) URL.revokeObjectURL(preview.url);
        setPreview(null);
        setSuccess(true);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        setError("We couldn\u2019t reach the server. Please try again in a moment.");
      }
    });
  }

  return (
    <PageShell>
      <section className="px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <header className="text-center mb-8">
            <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
              Gallery
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl text-plum">
              Submit a photo
            </h1>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Share a cherished photo in memory of Princess Gloria Mala Galabe.
              A family moderator will review each submission before it appears
              in the gallery.
            </p>
          </header>

          <EternalLightDivider />

          {success ? (
            <div role="status" aria-live="polite" className="text-center py-12 px-4">
              <div className="mx-auto max-w-md rounded-2xl bg-card border border-border/60 p-8">
                <p className="font-serif text-xl text-plum italic">
                  Thank you.
                </p>
                <p className="mt-3 text-foreground/80 leading-relaxed">
                  Your photo has been received and is pending review. Once a
                  family moderator has approved it, it will appear in the
                  gallery.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your kindness is a comfort to us.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
                >
                  Return home
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setName("");
                    setEmail("");
                    setCaption("");
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-muted-foreground font-sans text-sm sm:text-base hover:text-plum transition-colors min-h-[44px]"
                >
                  Submit another photo
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              {/* Honeypot */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
                <label htmlFor="company-field">Company (leave empty)</label>
                <input
                  id="company-field"
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  ref={companyRef}
                  defaultValue=""
                />
              </div>

              <Field id="name" label="Your name" required
                hint="This will appear alongside your photo.">
                <input id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)} maxLength={120}
                  required autoComplete="name"
                  className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
                  placeholder="e.g. Marceline Angafor" />
              </Field>

              <Field id="photo" label="Photo" required
                hint="JPEG, PNG, or WebP, 5 MB max.">
                <div className="flex flex-wrap gap-3">
                  {preview && (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border bg-lavender/50">
                      <img src={preview.url} alt="Selected photo"
                        className="w-full h-full object-cover" />
                      <button type="button" onClick={removePhoto}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 rounded-full bg-plum/80 hover:bg-plum text-warm-white p-1 transition-colors">
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  {!preview && (
                    <button type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-40 h-40 rounded-lg border border-dashed border-border bg-lavender/30 hover:bg-lavender/60 transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-plum"
                      aria-label="Select a photo">
                      <ImagePlus className="w-6 h-6" aria-hidden="true" />
                      <span className="text-xs mt-2">Choose photo</span>
                    </button>
                  )}
                  <input ref={fileInputRef} id="photo" type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => onPickPhoto(e.target.files)} className="sr-only" />
                </div>
              </Field>

              <Field id="caption" label="Caption (optional)"
                hint={`Up to ${MAX_CAPTION} characters. A short description of the photo.`}>
                <input id="caption" type="text" value={caption}
                  onChange={(e) => setCaption(e.target.value)} maxLength={MAX_CAPTION}
                  className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
                  placeholder="e.g. A family gathering in 2019" />
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {caption.length} / {MAX_CAPTION}
                </div>
              </Field>

              <Field id="email" label="Email (optional, private)"
                hint="Only seen by family moderators. We will never publish your email.">
                <input id="email" type="email" value={email}
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

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end items-center">
                <Link href="/"
                  className="text-sm text-muted-foreground hover:text-plum transition-colors px-4 py-3 min-h-[44px] inline-flex items-center">
                  Cancel
                </Link>
                <button type="submit" disabled={pending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed">
                  {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {pending ? "Sending\u2026" : "Submit photo"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Submissions are rate-limited. If you have already shared, please
                wait a few minutes before sharing again.
              </p>
            </form>
          )}
        </div>
      </section>
    </PageShell>
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
