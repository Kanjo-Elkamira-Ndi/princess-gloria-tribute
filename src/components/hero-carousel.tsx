"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { EternalLightDivider } from "@/components/eternal-light-divider";

type Slide = {
  src: string;
  alt: string;
  caption: string;
  subcaption: string;
};

const SLIDES: Slide[] = [
  {
    src: "/carousel_1.png",
    alt: "A tender moment from the life of Princess Gloria Mala Galabe",
    caption: "A heart that loved without measure",
    subcaption:
      "Her warmth touched every soul she met — a light that will never fade.",
  },
  {
    src: "/carousel_2.png",
    alt: "Princess Gloria surrounded by family and those she cherished",
    caption: "A life woven with grace and compassion",
    subcaption:
      "In every kindness, in every prayer, in every gathering — her spirit lives on.",
  },
  {
    src: "/carousel_3.png",
    alt: "A serene moment capturing the enduring legacy of Princess Gloria",
    caption: "Her memory is an eternal blessing",
    subcaption:
      "Though she rests in everlasting peace, her love remains with us always.",
  },
];

const AUTOPLAY_DELAY = 7000;

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <section className="relative w-full overflow-hidden bg-lavender/40">
      {/* Soft gradient overlay for text legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(95,75,107,0.55) 0%, rgba(95,75,107,0.20) 35%, rgba(95,75,107,0.35) 70%, rgba(95,75,107,0.65) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="min-w-0 shrink-0 grow-0 basis-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
            >
              <div className="relative flex items-center justify-center min-h-[70vh] sm:min-h-[78vh]">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered text content — overlays the slides */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center">
        <p className="font-serif italic text-sm sm:text-base text-warm-white/90 tracking-[0.2em] uppercase hero-ken-burns-none">
          In Loving Memory of
        </p>

        <h1 className="mt-3 font-serif text-4xl sm:text-6xl md:text-7xl text-warm-white leading-tight drop-shadow-[0_2px_20px_rgba(95,75,107,0.5)] hero-fade-up">
          Princess Gloria
          <span className="block italic font-light">Mala Galabe</span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-warm-white/95 tracking-wide font-sans hero-fade-up-delay-1">
          22 October 1965 &nbsp;—&nbsp; 24 June 2026
        </p>

        <div className="mt-8 max-w-xl hero-fade-up-delay-2">
          <p className="font-serif italic text-lg sm:text-2xl text-warm-white leading-snug drop-shadow-[0_1px_12px_rgba(59,51,64,0.6)]">
            {SLIDES[selected].caption}
          </p>
          <p className="mt-2 text-xs sm:text-sm text-warm-white/80 max-w-md mx-auto">
            {SLIDES[selected].subcaption}
          </p>
        </div>

        {/* Carousel dot indicators */}
        <div className="pointer-events-auto mt-8 flex items-center gap-2.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selected}
              className={
                "h-2 rounded-full transition-all duration-500 " +
                (i === selected
                  ? "w-8 bg-gold"
                  : "w-2 bg-warm-white/50 hover:bg-warm-white/80")
              }
            />
          ))}
        </div>

        <div className="hidden sm:block mt-8 hero-fade-up-delay-3">
          <EternalLightDivider className="!mt-4 !max-w-xs [&_.eternal-light__flame]:opacity-100 [&::before]:bg-gradient-to-l [&::before]:from-gold/80 [&::before]:to-transparent [&::after]:bg-gradient-to-r [&::after]:from-gold/80 [&::after]:to-transparent" />
        </div>

        {/* Calls to action */}
        <div className="pointer-events-auto mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Link
            href="/biography"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-warm-white text-plum font-sans text-sm sm:text-base font-medium hover:bg-warm-white/90 transition-all hover:shadow-xl hover:shadow-plum/20 min-h-[44px] hero-fade-up-delay-4"
          >
            Read her story
          </Link>
          <Link
            href="/tributes/new"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-warm-white/70 text-warm-white font-sans text-sm sm:text-base backdrop-blur-sm bg-plum/20 hover:bg-plum/40 transition-all hover:shadow-xl hover:shadow-plum/30 min-h-[44px] hero-fade-up-delay-4"
          >
            Leave a tribute
          </Link>
        </div>
      </div>
    </section>
  );
}
