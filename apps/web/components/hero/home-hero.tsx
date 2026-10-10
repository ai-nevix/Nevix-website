import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/motion';
import { Eyebrow } from '@/components/ui/section';
import { corePillars } from '@/content/service-categories';
import { brandAssets, ctas, siteConfig } from '@/content/site';

/**
 * Homepage hero.
 *
 * Art direction is taken from the supplied NEVIX photography: a skyline at first light seen from a
 * midnight workspace. The landscape half of that photograph fills the right of the hero and fades
 * into midnight behind the text, so the headline always sits on a solid, high-contrast field — on
 * a phone the picture recedes further still. The photograph's own logo and copy are outside the
 * region used (see scripts/derive-brand-assets.mjs), so nothing on screen says the same thing twice.
 *
 * The four pillars run beneath the call to action as the divided icon row that appears across the
 * brand artwork. It is real navigation, not decoration: each entry links to its pillar page.
 *
 * Server-rendered with no client JavaScript: this is the largest contentful paint on the site.
 */
export function HomeHero() {
  return (
    <section className="dark-section relative isolate overflow-hidden bg-ink-950">
      {/* --- The horizon --------------------------------------------------------------------- */}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[62%]">
        <Image
          src={brandAssets.heroHorizon.src}
          width={brandAssets.heroHorizon.width}
          height={brandAssets.heroHorizon.height}
          alt=""
          priority
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="h-full w-full object-cover object-[60%_center] opacity-60 lg:opacity-100"
        />
        {/* Midnight runs in from the left and settles along the top and bottom edges. */}
        <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/75 to-ink-950/0 lg:via-ink-950/40" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-transparent to-ink-950/50" />
      </div>

      {/* Electric-blue light behind the headline, as the N is lit on the supplied artwork. */}
      <div
        aria-hidden="true"
        className="absolute top-[-12rem] left-[-10rem] -z-10 size-[40rem] rounded-full bg-brand-600/25 blur-[120px]"
      />

      <Container className="relative">
        <div className="flex min-h-[calc(100svh-var(--header-height))] flex-col justify-center py-20 sm:py-24 lg:max-h-[56rem] lg:py-28">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow onDark>{siteConfig.tagline}</Eyebrow>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 text-display-2xl text-white">
                {/* The space keeps "Intelligence in Motion." whole for crawlers and screen readers,
                    which read text content and ignore the line break. */}
                Intelligence <br />
                <span className="text-gradient-brand">in Motion.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-300 sm:text-xl">
                {siteConfig.masterDescription}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" variant="onDark">
                  <Link href={ctas.primary.href}>
                    {ctas.primary.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outlineOnDark">
                  <Link href={ctas.services.href}>{ctas.services.label}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* --- Pillar row ---------------------------------------------------------------------- */}
          <Reveal delay={0.24} className="mt-16 lg:mt-20">
            <nav aria-label="Core capabilities">
              <ul className="grid max-w-3xl grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-white/15">
                {corePillars.map((pillar) => (
                  <li key={pillar.slug} className="sm:px-6 sm:first:pl-0">
                    <Link
                      href={`/services/${pillar.slug}`}
                      className="group flex flex-col items-start gap-3 rounded-lg"
                    >
                      <Icon
                        name={pillar.icon}
                        className="size-7 text-cyan-brand-400 transition-transform duration-300 group-hover:-translate-y-0.5"
                        strokeWidth={1.4}
                      />
                      <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-neutral-300 uppercase transition-colors group-hover:text-white">
                        {pillar.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </Container>

      <div className="horizon-line" aria-hidden="true" />
    </section>
  );
}
