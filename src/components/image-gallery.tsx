"use client";

import Image from "next/image";

type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/carousel_1.png",
    alt: "Princess Gloria Mala Galabe in a tender moment",
    caption: "A heart that loved without measure",
  },
  {
    src: "/carousel_2.png",
    alt: "Princess Gloria surrounded by family and those she cherished",
    caption: "A life woven with grace and compassion",
  },
  {
    src: "/carousel_3.png",
    alt: "A serene moment capturing the enduring legacy of Princess Gloria",
    caption: "Her memory is an eternal blessing",
  },
  {
    src: "/uploads/2939d30c7042fb1662702f84ffb6f8bc.webp",
    alt: "A cherished memory shared in tribute to Princess Gloria",
    caption: "Shared with love by a family friend",
  },
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
];

export function ImageGallery() {
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
          {GALLERY_IMAGES.map((image, index) => (
            <article
              key={index}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-lavender/50"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading={index < 3 ? "eager" : "lazy"}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              {image.caption && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                >
                  <p className="font-serif italic text-sm sm:text-base text-warm-white drop-shadow-lg">
                    {image.caption}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 font-sans text-sm text-plum hover:text-plum/70 transition-colors"
          >
            <span className="underline hover:no-underline">View all memories</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}