import Link from "next/link";
import { PageShell, EternalLightDivider } from "@/components/site-shell";
import { HeroCarousel } from "@/components/hero-carousel";
import { getApprovedTributeCount } from "@/lib/tributes";

export default async function LandingPage() {
  const tributeCount = await getApprovedTributeCount();

  return (
    <PageShell>
      {/* Hero — full-bleed carousel with name, dates, and CTAs overlaid */}
      <HeroCarousel />

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
