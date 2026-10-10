import Link from 'next/link';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

/**
 * 404 page (instruction §52).
 *
 * Rendered outside the marketing route group, so it brings its own header and footer — a visitor
 * who lands on a broken link still gets full navigation rather than a dead end.
 */
const suggestions = [
  { label: 'Services', href: '/services', description: 'Six categories, thirty-five services' },
  { label: 'Solutions', href: '/solutions', description: 'Outcome-oriented solution patterns' },
  { label: 'Industries', href: '/industries', description: 'Sector context and capability areas' },
  { label: 'Insights', href: '/insights', description: 'Writing from the engineering team' },
];

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Header />

      {/* Midnight, like the opening of every other page — the floating glass header is designed to
          sit over a dark field, not over white. */}
      <main
        id="main-content"
        className="brand-field dark-section hero-offset relative flex flex-1 items-center overflow-hidden"
      >
        <Container size="prose" className="relative">
          <div className="py-20 sm:py-28">
            <p className="font-display text-sm font-semibold tracking-[0.26em] text-cyan-brand-300">
              404
            </p>
            <h1 className="mt-4 text-display-md text-white">That page does not exist</h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-300">
              The link may be out of date, or the address may have a typo in it. Nothing is broken
              on your side.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="onDark">
                <Link href="/">Back to the homepage</Link>
              </Button>
              <Button asChild size="lg" variant="outlineOnDark">
                <Link href="/search">Search the site</Link>
              </Button>
            </div>

            <nav aria-labelledby="suggestions-heading" className="mt-14">
              <h2
                id="suggestions-heading"
                className="font-sans text-eyebrow text-neutral-400 uppercase"
              >
                Try one of these
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {suggestions.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="card-glass card-interactive relative block p-4"
                    >
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      <span className="mt-1 block text-sm text-neutral-400">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
        <div className="horizon-line" aria-hidden="true" />
      </main>

      <Footer />
    </div>
  );
}
