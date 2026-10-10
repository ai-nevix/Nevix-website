'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/layout/logo';
import { DesktopNav } from '@/components/navigation/desktop-nav';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ctas } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Site header — a floating pill of frosted midnight glass.
 *
 * The header is fixed and out of the page flow, so every page's opening section runs up behind it
 * (each carries `.hero-offset` to keep its own content clear). The glass therefore always has
 * something to frost — the hero photograph, the brand light — rather than a flat colour.
 *
 * Legibility is designed in, not left to chance. At the top of a page the pill sits over a midnight
 * hero and can be very sheer. Once the page scrolls, light sections pass beneath it, so the glass
 * thickens: at that tint white text keeps well above AA contrast even over pure white.
 *
 * The outer bar spans the viewport but ignores the pointer, so the air around the pill never
 * blocks a click on the content beneath it. The scroll listener is passive and only flips a
 * boolean, so it does no work per frame.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="on-dark pointer-events-none fixed inset-x-0 top-0 z-40">
      <Container>
        <div
          className={cn(
            'pointer-events-auto relative mt-2.5 flex items-center justify-between gap-4 rounded-full border pr-2 pl-5 lg:mt-3.5 lg:pl-6',
            'backdrop-blur-2xl backdrop-saturate-150',
            'transition-[background-color,border-color,box-shadow,height] duration-500 ease-(--ease-out-brand)',
            // A faint highlight along the top edge is what makes glass read as glass.
            'shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1),0_18px_50px_-22px_rgb(2_6_15/0.9)]',
            scrolled
              ? 'h-14 border-white/12 bg-ink-950/78 lg:h-15'
              : 'h-14 border-white/10 bg-ink-950/35 lg:h-16',
          )}
        >
          {/* Sheen: light from above, fading down the glass. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/[0.07] to-transparent"
          />
          {/* A thread of the N's gradient along the bottom edge. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 -bottom-px h-px bg-linear-to-r from-transparent via-cyan-brand-400/60 to-transparent"
          />

          <div className="relative flex w-full items-center justify-between gap-4">
            <Logo priority />

            <DesktopNav />

            <div className="flex items-center gap-1.5">
              <Link
                href="/search"
                aria-label="Search the site"
                className="inline-flex size-11 items-center justify-center rounded-full text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Search className="size-5" aria-hidden="true" />
              </Link>

              {/* Hidden from 1024 to 1279px, where the full navigation needs the room; the same
                  call to action ends every page and sits in the menu below 1024px. */}
              <Button
                asChild
                variant="onDark"
                size="sm"
                className="hidden h-10 px-5 sm:inline-flex lg:hidden xl:inline-flex"
              >
                <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
              </Button>

              <MobileNav />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
