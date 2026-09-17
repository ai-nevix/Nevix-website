import Link from 'next/link';

import { SolutionCard } from '@/components/cards';
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
 * Solutions are outcome-oriented and must not simply restate the services page. Each entry leads
 * with the business problem rather than the capability.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Solutions',
  description:
    'Outcome-oriented solution patterns from VASTRIX: document processing, intelligent ticket triage, workflow automation, knowledge assistants, operational dashboards, digital portals and more.',
  path: '/solutions',
});

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Solutions', href: '/solutions' }]}
        eyebrow="Solutions"
        title="Start from the problem, not the technology"
        description="A service answers what VASTRIX can build. A solution answers how a specific business problem gets solved — the workflow, the technical approach and the kind of outcome it is designed to produce."
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
                <dd className="mt-1 text-neutral-400">What can VASTRIX build?</dd>
              </div>
              <div>
                <dt className="font-bold text-white">Solutions</dt>
                <dd className="mt-1 text-neutral-400">How does it solve a business problem?</dd>
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
          eyebrow={`${solutions.length} solution patterns`}
          title="Where we see the same problem repeatedly"
          description="Each of these combines several services into an end-to-end approach. Every one is composed only of capabilities documented in our service catalogue."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <StaggerItem as="li" key={solution.slug}>
                <SolutionCard solution={solution} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal className="mt-14">
          {/* DUMMY-DATA: DD-012 — replace illustrative outcomes with measured ones when available. */}
          <Notice variant="illustrative" title="About the outcomes described on these pages">
            Solution pages describe the kind of result each pattern is designed to produce. They are
            illustrative, not guarantees. VASTRIX does not publish guaranteed ROI, accuracy or
            automation figures — measurable objectives are agreed and evidenced per engagement.
          </Notice>
        </Reveal>
      </Section>

      <CtaSection
        eyebrow="No pattern quite fits?"
        title="Most problems do not arrive pre-categorised"
        description="If none of these match what you are dealing with, describe the problem in your own terms. Working out which capabilities apply is our job, not yours."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
