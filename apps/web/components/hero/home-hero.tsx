import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/motion';
import { corePillars } from '@/content/service-categories';
import { ctas, siteConfig } from '@/content/site';

/**
 * Homepage hero.
 *
 * Visual direction from the supplied brand material: a midnight field with blue/cyan light
 * sources and a faint engineering grid (the `.brand-field` treatment), rather than the supplied
 * banner image dropped in as a background. Instruction §68 asks for a coherent visual language
 * around intelligence, exploration, technology and progress — not a copy of the banner.
 *
 * Deliberately server-rendered with no client JavaScript: this is the largest contentful paint on
 * the site, and the only motion is a CSS-driven sheen that respects reduced-motion.
 */
export function HomeHero() {
  return (
    <section className="brand-field dark-section relative overflow-hidden">
      <Container className="relative">
        <div className="grid gap-16 py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-20 lg:py-32">
          <div className="max-w-2xl">
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-eyebrow text-neutral-300 uppercase backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-cyan-brand-400" aria-hidden="true" />
                {siteConfig.pillarLine}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 text-display-xl text-white">
                Intelligent Technology
                <br />
                for a <span className="text-gradient-brand">Smarter Tomorrow.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-neutral-300 sm:text-xl">
                {siteConfig.masterDescription}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

            <Reveal delay={0.24}>
              <p className="mt-12 text-eyebrow text-cyan-brand-400 uppercase">
                {siteConfig.tagline}
              </p>
            </Reveal>
          </div>

          {/*
            Four-pillar strip. On desktop this sits beside the headline as a vertical list; on
            mobile it stacks below. It is a real navigation list, not decoration — each entry is a
            link to the pillar page.
          */}
          <Reveal delay={0.2} className="lg:w-72">
            <nav aria-label="Core capabilities">
              <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-(--radius-panel) border border-white/12 bg-white/8 lg:grid-cols-1">
                {corePillars.map((pillar) => (
                  <li key={pillar.slug}>
                    <Link
                      href={`/services/${pillar.slug}`}
                      className="flex h-full items-center gap-3.5 bg-ink-900/70 p-4 backdrop-blur-sm transition-colors hover:bg-ink-800/80 lg:p-5"
                    >
                      <Icon name={pillar.icon} className="size-5 shrink-0 text-cyan-brand-400" />
                      <span className="text-sm font-semibold text-white">{pillar.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </Container>

      {/* Hairline sheen across the bottom edge. Purely decorative, and paused for reduced motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
      >
        <div className="h-full w-full bg-linear-to-r from-transparent via-cyan-brand-400/50 to-transparent" />
        <div className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent motion-safe:animate-[vastrix-sheen_6s_var(--ease-in-out-brand)_infinite]" />
      </div>
    </section>
  );
}
