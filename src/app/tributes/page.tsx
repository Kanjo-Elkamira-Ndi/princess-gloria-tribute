import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { getApprovedTributes } from "@/lib/tributes";
import { TributeCard } from "@/components/tribute-card";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "Tributes — Princess Gloria Mala Galabe",
};

export const dynamic = "force-dynamic";

export default async function TributesWallPage() {
  const tributes = await getApprovedTributes();

  return (
    <PageShell>
      <section className="px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <header className="text-center mb-10">
            <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
              Tributes
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl text-plum">
              In her honour
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-foreground/75 leading-relaxed">
              These are the words shared by family, friends, and well-wishers.
              Each tribute has been reviewed by a family moderator before
              appearing here.
            </p>
          </header>

          <EternalLightDivider />

          {tributes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="font-serif italic text-plum text-lg">
                No tributes have been shared yet.
              </p>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                If you knew Princess Gloria and would like to share a memory or
                a few words, you are warmly invited to do so.
              </p>
              <div className="mt-8">
                <Link
                  href="/tributes/new"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px]"
                >
                  Leave a tribute
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground mb-8">
                {tributes.length} {tributes.length === 1 ? "tribute" : "tributes"} shared
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tributes.map((t) => (
                  <li key={t.id}>
                    <TributeCard
                      name={t.name}
                      relationship={t.relationship}
                      message={t.message}
                      photos={t.photos}
                      date={format(new Date(t.createdAt), "d MMMM yyyy")}
                    />
                  </li>
                ))}
              </ul>

              <div className="text-center mt-16">
                <Link
                  href="/tributes/new"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
                >
                  Leave a tribute
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
