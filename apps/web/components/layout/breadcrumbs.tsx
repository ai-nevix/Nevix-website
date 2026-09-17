import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, type BreadcrumbEntry } from '@/lib/seo/structured-data';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb trail.
 *
 * Emits BreadcrumbList structured data alongside the visible trail (specification §23.2).
 * The current page is rendered as plain text with `aria-current="page"` rather than as a link to
 * itself.
 */
export function Breadcrumbs({
  entries,
  onDark = false,
  className,
}: {
  /** Ordered from the site root to the current page. The last entry is the current page. */
  entries: BreadcrumbEntry[];
  onDark?: boolean;
  className?: string;
}) {
  const trail: BreadcrumbEntry[] = [{ name: 'Home', href: '/' }, ...entries];

  return (
    <>
      <JsonLd id={`breadcrumb-${entries.at(-1)?.href ?? 'root'}`} data={breadcrumbSchema(trail)} />

      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          {trail.map((entry, index) => {
            const isLast = index === trail.length - 1;

            return (
              <li key={entry.href} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight
                    className={cn('size-3.5', onDark ? 'text-neutral-600' : 'text-neutral-400')}
                    aria-hidden="true"
                  />
                ) : null}

                {isLast ? (
                  <span
                    aria-current="page"
                    className={cn('font-medium', onDark ? 'text-neutral-300' : 'text-neutral-700')}
                  >
                    {entry.name}
                  </span>
                ) : (
                  <Link
                    href={entry.href}
                    className={cn(
                      'transition-colors',
                      onDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-neutral-500 hover:text-brand-700',
                    )}
                  >
                    {entry.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
