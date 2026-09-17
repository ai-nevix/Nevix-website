import type { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/motion';
import type { BreadcrumbEntry } from '@/lib/seo/structured-data';

/**
 * Standard inner-page hero.
 *
 * Every page below the homepage uses this so the entry point looks consistent: breadcrumb,
 * eyebrow, h1, lead paragraph, optional actions, optional aside. It is the only place an `h1` is
 * rendered on an inner page.
 */
export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  description,
  actions,
  aside,
  notice,
}: {
  breadcrumbs: BreadcrumbEntry[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Supporting panel shown beside the text on wide screens. */
  aside?: ReactNode;
  /** Governance or status notice rendered directly under the description. */
  notice?: ReactNode;
}) {
  return (
    <section className="brand-field dark-section">
      <Container>
        <div className="py-14 sm:py-16 lg:py-20">
          <Breadcrumbs entries={breadcrumbs} onDark />

          <div
            className={
              aside
                ? 'mt-9 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16'
                : 'mt-9'
            }
          >
            <div className="max-w-3xl">
              {eyebrow ? (
                <Reveal>
                  <p className="text-eyebrow text-cyan-brand-400 uppercase">{eyebrow}</p>
                </Reveal>
              ) : null}

              <Reveal delay={0.05}>
                <h1 className="mt-4 text-display-lg text-white">{title}</h1>
              </Reveal>

              {description ? (
                <Reveal delay={0.1}>
                  <div className="mt-6 text-lg leading-relaxed text-neutral-300">{description}</div>
                </Reveal>
              ) : null}

              {notice ? (
                <Reveal delay={0.12}>
                  <div className="mt-7">{notice}</div>
                </Reveal>
              ) : null}

              {actions ? (
                <Reveal delay={0.16}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
                </Reveal>
              ) : null}
            </div>

            {aside ? (
              <Reveal delay={0.14} className="lg:pt-2">
                {aside}
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
