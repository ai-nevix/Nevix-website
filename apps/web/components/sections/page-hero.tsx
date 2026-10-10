import Image from 'next/image';
import type { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/motion';
import { Eyebrow } from '@/components/ui/section';
import { brandAssets } from '@/content/site';
import type { BreadcrumbEntry } from '@/lib/seo/structured-data';

/**
 * Standard inner-page hero.
 *
 * Every page below the homepage uses this so the entry point looks consistent: breadcrumb,
 * eyebrow, h1, lead paragraph, optional actions, optional aside. It is the only place an `h1` is
 * rendered on an inner page.
 *
 * The N sits large and faint off the right edge, lit from behind — the brand signature without
 * competing with the heading. It is decorative and hidden from assistive technology; on narrow
 * screens, where it would sit behind the text, it is dropped.
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
    <section className="brand-field dark-section relative overflow-hidden">
      {aside ? null : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[-6rem] hidden w-[26rem] -translate-y-1/2 lg:block xl:right-[-2rem]"
        >
          <div className="absolute inset-[15%] rounded-full bg-brand-600/30 blur-3xl" />
          <Image
            src={brandAssets.mark.src}
            width={brandAssets.mark.width}
            height={brandAssets.mark.height}
            alt=""
            sizes="416px"
            className="relative h-auto w-full opacity-[0.14] mix-blend-screen"
          />
        </div>
      )}

      <Container className="relative">
        <div className="py-14 sm:py-16 lg:py-24">
          <Breadcrumbs entries={breadcrumbs} onDark />

          <div
            className={
              aside
                ? 'mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16'
                : 'mt-10'
            }
          >
            <div className="max-w-3xl">
              {eyebrow ? (
                <Reveal>
                  <Eyebrow onDark>{eyebrow}</Eyebrow>
                </Reveal>
              ) : null}

              <Reveal delay={0.05}>
                <h1 className="mt-5 text-display-lg text-white">{title}</h1>
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

      <div className="horizon-line" aria-hidden="true" />
    </section>
  );
}
