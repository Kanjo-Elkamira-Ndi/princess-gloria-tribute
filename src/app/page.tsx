import Link from "next/link";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { getApprovedTributeCount } from "@/lib/tributes";

export default async function LandingPage() {
  const tributeCount = await getApprovedTributeCount();

  return (
    <PageShell>
      {/* Hero — name, dates, portrait, divider, CTAs */}
      <section className="px-5 sm:px-8 pt-12 sm:pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif italic text-sm sm:text-base text-muted-foreground tracking-wide">
            In Loving Memory of
          </p>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl text-plum leading-tight">
            Princess Gloria
            <span className="block italic font-light">Mala Galabe</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-foreground/80 tracking-wide">
            22 October 1965 &nbsp;—&nbsp; 24 June 2026
          </p>

          {/* Portrait */}
          <div className="mt-10 mx-auto max-w-sm">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-lavender/50 shadow-sm">
              <img
                src="/portrait-placeholder.png"
                alt="A soft floral tribute in memory of Princess Gloria Mala Galabe — a single white lily with pale lavender blooms, painted in gentle watercolor on a warm cream background."
                className="w-full h-auto object-cover"
                width={864}
                height={1152}
                loading="eager"
              />
              <p className="sr-only">
                Portrait of Princess Gloria Mala Galabe. The family may replace
                this placeholder with her photograph.
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground italic">
              A life of love, faith, compassion, and selfless service.
            </p>
          </div>

          <EternalLightDivider className="!mt-14" />

          {/* Calls to action */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <Link
              href="/biography"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-plum text-warm-white font-sans text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Read her story
            </Link>
            <Link
              href="/tributes/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
            >
              Leave a tribute
            </Link>
          </div>
        </div>
      </section>

      {/* Brief remembrance — sets the tone without inventing facts */}
      <section className="px-5 sm:px-8 py-12 bg-lavender/30">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-xl sm:text-2xl text-plum italic leading-relaxed">
            &ldquo;O death, where is thy sting? O grave, where is thy victory?&rdquo;
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            1 Corinthians 15:55
          </p>
        </div>
      </section>

      {/* Tribute wall preview */}
      <section className="px-5 sm:px-8 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <EternalLightDivider />
          <h2 className="font-serif text-2xl sm:text-3xl text-plum">
            Tributes from those who loved her
          </h2>
          <p className="mt-4 text-foreground/75 leading-relaxed">
            Family, friends, and well-wishers have shared{" "}
            <span className="font-medium text-plum">{tributeCount}</span>{" "}
            {tributeCount === 1 ? "tribute" : "tributes"} in honour of Princess
            Gloria. Each one is reviewed by a family moderator before it
            appears here, so that this space remains gentle and true to her
            memory.
          </p>
          <div className="mt-8">
            <Link
              href="/tributes"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
            >
              Visit the tributes wall
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
