"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/img_card_1.jpg",
    alt: "Princess Gloria Mala Galabe in a tender moment",
    caption: "A heart that loved without measure",
  },
  {
    src: "/img_card_2.jpg",
    alt: "Princess Gloria surrounded by family and those she cherished",
    caption: "A life woven with grace and compassion",
  },
  {
    src: "/img_card_3.jpg",
    alt: "A serene moment capturing the enduring legacy of Princess Gloria",
    caption: "Her memory is an eternal blessing",
  },
  {
    src: "/img_card_4.jpg",
    alt: "A cherished memory shared in tribute to Princess Gloria",
    caption: "Shared with love by a family friend",
  },
  {
    src: "/img_card_5.jpg",
    alt: "Princess Gloria in quiet reflection",
    caption: "In every kindness, her spirit lives on",
  },
  {
    src: "/img_card_6.jpg",
    alt: "A joyful gathering in honour of Princess Gloria",
    caption: "Together in love, forever in our hearts",
  },
  {
    src: "/img_card_7.jpg",
    alt: "A peaceful moment from Princess Gloria's life",
    caption: "Grace in every step she took",
  },
  {
    src: "/img_card_8.jpg",
    alt: "Princess Gloria's radiant smile",
    caption: "Her light continues to shine through us",
  },
];

export function ImageGallery({
  additionalPhotos = [],
}: {
  additionalPhotos?: GalleryImage[];
}) {
  const allImages = useMemo(
    () => [...GALLERY_IMAGES, ...additionalPhotos],
    [additionalPhotos]
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + allImages.length) % allImages.length
    );
  }, [allImages.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % allImages.length
    );
  }, [allImages.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, closeLightbox, goToPrevious, goToNext]);

  return (
    <section className="px-5 sm:px-8 py-16 bg-lavender/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="font-serif italic text-sm text-muted-foreground tracking-wide">
            Gallery
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-plum">
            Moments to cherish
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-foreground/75 leading-relaxed">
            A glimpse into the life of Princess Gloria Mala Galabe — moments of
            grace, love, and the enduring legacy she leaves behind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {allImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-lavender/50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"
              aria-label={`View ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading={index < 3 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-serif italic text-sm sm:text-base text-warm-white drop-shadow-lg">
                    {image.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/gallery-photos/new"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-plum text-plum font-sans text-sm sm:text-base hover:bg-lavender/60 transition-colors min-h-[44px]"
          >
            Submit a photo
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 rounded-full bg-warm-white/10 text-warm-white hover:bg-warm-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-white"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-2 sm:left-6 z-50 p-3 rounded-full bg-warm-white/10 text-warm-white hover:bg-warm-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-white"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 sm:right-6 z-50 p-3 rounded-full bg-warm-white/10 text-warm-white hover:bg-warm-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-white"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image container */}
          <div className="relative w-full max-w-4xl max-h-[85vh] mx-12 sm:mx-20">
            <Image
              src={allImages[selectedIndex].src}
              alt={allImages[selectedIndex].alt}
              width={1200}
              height={1500}
              className="object-contain w-full h-full max-h-[85vh]"
              priority
            />
          </div>

          {/* Caption */}
          {allImages[selectedIndex].caption && (
            <div className="absolute bottom-6 left-0 right-0 text-center px-4">
              <p className="font-serif italic text-sm sm:text-base text-warm-white/90 drop-shadow-lg">
                {allImages[selectedIndex].caption}
              </p>
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-warm-white/70 text-sm font-sans">
            {selectedIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </section>
  );
}