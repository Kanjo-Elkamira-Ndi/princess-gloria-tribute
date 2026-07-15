import { Suspense } from "react";
import { PageShell } from "@/components/site-shell";
import { Loader2 } from "lucide-react";
import { LoginClient } from "./login-client";

export default function AdminLoginPage() {
  return (
    <PageShell>
      <section className="px-5 sm:px-8 py-12 sm:py-20">
        <div className="mx-auto max-w-md">
          <header className="text-center mb-8">
            <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
              Family Moderator
            </p>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl text-plum">
              Sign in to review tributes
            </h1>
          </header>

          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-plum" />
              </div>
            }
          >
            <LoginClient />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
