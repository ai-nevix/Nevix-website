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
 * Sticky site header — midnight glass on every page.
 *
 * Every page opens on a midnight hero, so a dark header reads as part of it rather than a white bar
 * laid over the top. Once the page scrolls onto light content the glass turns more opaque and
 * gains a hairline, so the navigation stays legible over anything.
 *
 * The scroll listener is passive and only flips a boolean, so it does no work per frame.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'on-dark sticky top-0 z-40 w-full transition-[background-color,box-shadow,border-color] duration-300',
        // Solid at the top, where it sits in flow above the hero; glass once content passes under it.
        scrolled
          ? 'border-b border-white/10 bg-ink-950/90 shadow-[0_12px_40px_-24px_rgb(0_0_0/0.8)] backdrop-blur-xl'
          : 'border-b border-white/5 bg-ink-950',
      )}
    >
      <Container>
        <div className="flex h-(--header-height) items-center justify-between gap-4">
          <Logo priority />

          <DesktopNav />

          <div className="flex items-center gap-1.5">
            <Link
              href="/search"
              aria-label="Search the site"
              className="inline-flex size-11 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/8 hover:text-white"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>

            <Button asChild variant="onDark" className="hidden sm:inline-flex">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>

            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
