import Image from "next/image";

/**
 * Tribute card — displays an APPROVED tribute on the public wall.
 * Server component — no client JS needed.
 */
export function TributeCard({
  name,
  relationship,
  message,
  photos,
  date,
}: {
  name: string;
  relationship: string;
  message: string;
  photos: string[];
  date: string;
}) {
  return (
    <article className="h-full flex flex-col rounded-2xl bg-card border border-border/60 p-6 shadow-sm">
      {/* Optional photo — first one only, others accessible via lightbox if added */}
      {photos.length > 0 && (
        <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-xl bg-lavender/50">
          <Image
            src={photos[0]}
            alt={`A photo shared by ${name} in tribute to Princess Gloria Mala Galabe.`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex-1">
        <p className="font-serif text-lg text-plum leading-snug">
          {message}
        </p>
      </div>

      <footer className="mt-5 pt-4 border-t border-border/60">
        <p className="font-sans text-sm font-medium text-foreground">
          {name}
        </p>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          {relationship}
          <span className="mx-2" aria-hidden="true">·</span>
          {date}
        </p>
        {photos.length > 1 && (
          <p className="font-sans text-xs text-muted-foreground mt-1">
            + {photos.length - 1} more {photos.length - 1 === 1 ? "photo" : "photos"}
          </p>
        )}
      </footer>
    </article>
  );
}
