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

      <main id="main-content" className="flex flex-1 items-center">
        <Container size="prose">
          <div className="py-20 sm:py-28">
            <p className="font-mono text-sm font-bold text-brand-600">404</p>
            <h1 className="mt-4 text-display-md text-neutral-900">That page does not exist</h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">
              The link may be out of date, or the address may have a typo in it. Nothing is broken
              on your side.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/">Back to the homepage</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/search">Search the site</Link>
              </Button>
            </div>

            <nav aria-labelledby="suggestions-heading" className="mt-14">
              <h2 id="suggestions-heading" className="text-eyebrow text-neutral-500 uppercase">
                Try one of these
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {suggestions.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand-300"
                    >
                      <span className="text-sm font-bold text-neutral-900">{item.label}</span>
                      <span className="mt-1 block text-sm text-neutral-600">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
