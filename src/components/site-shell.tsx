"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { EternalLightDivider } from "@/components/eternal-light-divider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/biography", label: "Her Story" },
  { href: "/tributes", label: "Tributes" },
  { href: "/tributes/new", label: "Leave a Tribute" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-border/60 bg-warm-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-base sm:text-lg text-plum hover:opacity-80 transition-opacity"
          >
            <span className="italic">In Loving Memory of</span>
            <span className="block text-xs sm:text-sm tracking-wide text-muted-foreground not-italic">
              Princess Gloria Mala Galabe
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1 sm:gap-4 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="px-2 sm:px-3 py-2 rounded-md text-foreground/80 hover:text-plum hover:bg-lavender/60 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-plum hover:bg-lavender/60 transition-colors min-h-[44px] min-w-[44px]"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col pt-16">
                <ul className="flex flex-col">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block px-6 py-4 text-base text-foreground/80 hover:text-plum hover:bg-lavender/60 transition-colors border-b border-border/40"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-lavender/40">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 text-center">
        <p className="font-serif italic text-plum text-sm sm:text-base">
          Eternal rest grant unto her, O Lord.
        </p>
        <p className="font-serif italic text-plum text-sm sm:text-base mt-1">
          And let perpetual light shine upon her.
        </p>
        <div className="mt-6 text-xs text-muted-foreground">
          <p>
            In Loving Memory of Princess Gloria Mala Galabe
          </p>
          <p className="mt-1">
            22 October 1965 — 24 June 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Standard page wrapper: sticky header, content area, sticky footer.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 w-full">{children}</main>
      <SiteFooter />
    </div>
  );
}

export { EternalLightDivider };
