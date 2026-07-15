"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EternalLightDivider } from "@/components/site-shell";
import { Loader2 } from "lucide-react";

export function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    startTransition(async () => {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError(
          "Those details didn\u2019t match. Please check your email and password and try again."
        );
        return;
      }

      router.push(from);
      router.refresh();
    });
  }

  return (
    <>
      <EternalLightDivider />

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block font-sans text-sm font-medium text-plum mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
            placeholder="family@gloriagamemorial.org"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-sans text-sm font-medium text-plum mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-input bg-warm-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum min-h-[44px]"
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {pending ? "Signing in\u2026" : "Sign in"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Moderator access is restricted to the family. If you believe you
          should have access, please contact the family directly.
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="text-plum hover:underline"
          >
            Return to the memorial
          </Link>
        </p>
      </div>
    </>
  );
}
