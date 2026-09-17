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
 * Sticky site header.
 *
 * Scroll state adds a border and shadow once the page has moved, so the header separates from
 * content without being visually heavy at the top of the page. The scroll listener is passive and
 * only flips a boolean, so it does not cause work on every frame.
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
        'sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md transition-shadow duration-200',
        scrolled ? 'border-b border-neutral-200 shadow-sm' : 'border-b border-transparent',
      )}
    >
      <Container>
        <div className="flex h-(--header-height) items-center justify-between gap-4">
          <Logo className="h-9 lg:h-10" priority />

          <DesktopNav />

          <div className="flex items-center gap-1.5">
            <Link
              href="/search"
              aria-label="Search the site"
              className="inline-flex size-11 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>

            <Button asChild className="hidden sm:inline-flex">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>

            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
