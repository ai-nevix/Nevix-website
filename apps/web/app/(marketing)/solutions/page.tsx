import Link from 'next/link';

import { SolutionFlipTile } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { ctas } from '@/content/site';
import { getSolutions } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Solutions index — specification §8, instruction §20.
 *
 * Unlike the service catalogue, every entry here is a named project NEVIX has actually designed
 * or built. Each carries a build-status badge (Concept, Prototype, Beta, Live) stating plainly how
 * far it has actually got, rather than presenting every entry as equally finished.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Solutions',
  description:
    'Projects NEVIX has built: AquaSales, Meditech Buddy, Nevix Cloud Matrix, RESQ Agent, ThyroidAI and more, spanning AI, automation, data platforms and digital engineering — each labelled with its actual build status.',
  path: '/solutions',
});

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Solutions', href: '/solutions' }]}
        eyebrow="Solutions"
        title="Projects we have actually built"
        description="A service answers what NEVIX can build. A solution shows a specific project — the problem it addresses, how it works and the technology behind it — labelled with its real build status rather than presented as finished."
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/services">Browse by capability</Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-eyebrow text-cyan-brand-400 uppercase">How these differ</p>
            <dl className="mt-5 flex flex-col gap-4 text-sm">
              <div>
                <dt className="font-bold text-white">Services</dt>
                <dd className="mt-1 text-neutral-400">What can NEVIX build?</dd>
              </div>
              <div>
                <dt className="font-bold text-white">Solutions</dt>
                <dd className="mt-1 text-neutral-400">What has NEVIX actually built?</dd>
              </div>
              <div>
                <dt className="font-bold text-white">Industries</dt>
                <dd className="mt-1 text-neutral-400">Where is it relevant?</dd>
              </div>
            </dl>
          </div>
        }
      />

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow={`${solutions.length} projects`}
          title="Each one labelled with where it actually stands"
          description="Hover, focus or tap a tile to flip it and see what it does — Concept means a planning document with no code; Prototype means a working demonstration that has not been independently verified or deployed; Beta means built and functioning, with active development ongoing; Live means generally available and supported."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <StaggerItem as="li" key={solution.slug}>
                <SolutionFlipTile solution={solution} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal className="mt-14">
          <Notice variant="illustrative" title="About the capabilities described on these pages">
            Solution pages describe what each project is designed to do. They are illustrative, not
            guarantees. NEVIX does not publish guaranteed ROI, accuracy or automation figures — where
            a project has not been independently verified or is a specification rather than a build,
            the status badge and the note on that page say so.
          </Notice>
        </Reveal>
      </Section>

      <CtaSection
        eyebrow="Looking for something specific?"
        title="Most problems do not arrive pre-categorised"
        description="If none of these match what you are dealing with, describe the problem in your own terms. Working out which capabilities apply is our job, not yours."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
