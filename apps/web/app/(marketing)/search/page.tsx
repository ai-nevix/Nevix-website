import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { Section } from '@/components/ui/section';
import { buildMetadata } from '@/lib/seo/metadata';
import { SEARCH_TYPE_LABELS, search } from '@/lib/search';

/**
 * Site search.
 *
 * Server-rendered from the `q` query parameter with a plain GET form — so it works without
 * JavaScript, results are linkable and shareable, and there is no client-side search bundle.
 *
 * `noIndex`: search result pages are thin and infinitely variable; indexing them is a known SEO
 * anti-pattern.
 */
export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Search',
  description:
    'Search VASTRIX services, solutions, industries, products, case studies and insights.',
  path: '/search',
  seo: { noIndex: true },
});

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <EmptyState
        title="What are you looking for?"
        description="Search across services, solutions, industries, products, case studies and insights."
      />
    );
  }

  const results = await search(query);

  if (results.length === 0) {
    return (
      <EmptyState
        title={`No results for “${query}”`}
        description="Try a different term, or describe the problem to us directly — most enquiries do not arrive with the right keyword attached."
        action={
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Discuss a project
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-neutral-600" role="status">
        {results.length} {results.length === 1 ? 'result' : 'results'} for{' '}
        <span className="font-semibold text-neutral-900">“{query}”</span>
      </p>

      <ul className="mt-8 flex flex-col divide-y divide-neutral-200">
        {results.map((result) => (
          <li key={result.href} className="group relative py-6 first:pt-0">
            <Badge tone="neutral">{SEARCH_TYPE_LABELS[result.type]}</Badge>

            <h2 className="mt-3 text-lg font-bold tracking-tight text-neutral-900">
              <Link
                href={result.href}
                className='group-hover:text-brand-700 after:absolute after:inset-0 after:content-[""]'
              >
                {result.title}
              </Link>
            </h2>

            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{result.excerpt}</p>
            <p className="mt-2 font-mono text-xs text-neutral-500">{result.href}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  return (
    <>
      <section className="brand-field dark-section">
        <Container size="prose">
          <div className="py-14 sm:py-16">
            <Breadcrumbs entries={[{ name: 'Search', href: '/search' }]} onDark />
            <h1 className="mt-9 text-display-md text-white">Search</h1>

            {/* A plain GET form: works with JavaScript disabled, and results are linkable. */}
            <form action="/search" method="get" role="search" className="mt-8">
              <label htmlFor="q" className="sr-only">
                Search VASTRIX
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon
                    className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  />
                  <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder="document processing, ticket triage, dashboards…"
                    autoComplete="off"
                    className="h-12 w-full rounded-lg border border-white/15 bg-white/5 pr-4 pl-11 text-base text-white placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center rounded-lg bg-white px-5 text-sm font-semibold text-ink-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-brand-400"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </Container>
      </section>

      <Section tone="light" size="lg" containerSize="prose">
        <Suspense key={q} fallback={<LoadingState label="Searching" />}>
          <SearchResults query={q} />
        </Suspense>
      </Section>
    </>
  );
}
