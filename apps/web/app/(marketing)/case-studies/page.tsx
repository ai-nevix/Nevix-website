import Link from 'next/link';

import { CaseStudyCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { ctas } from '@/content/site';
import { getCaseStudies } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Case studies index.
 *
 * DUMMY-DATA: DD-001
 * Every case study is demonstration content. The page states that before showing any of them,
 * because catalogue §16 forbids publishing case studies without permission and specification §31
 * requires evidence for any published metric.
 *
 * The index is `noIndex` so demonstration content cannot surface in search results as if it were
 * delivered client work.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Case Studies',
  description:
    'Demonstration case studies showing how NEVIX approaches a problem — the architecture, the implementation and the trade-offs. These are illustrative examples, not delivered client work.',
  path: '/case-studies',
  seo: { noIndex: true },
});

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();
  const demoCount = caseStudies.filter((c) => c.kind === 'demo').length;
  const approved = caseStudies.filter((c) => c.kind === 'approved');

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Case Studies', href: '/case-studies' }]}
        eyebrow="Case Studies"
        title="How we approach a problem"
        description="NEVIX has not yet published client engagements. Rather than leave this section empty, we have written up the approach we take — the discovery, the architecture, the decisions and the things we got wrong along the way."
        notice={
          demoCount > 0 ? (
            <Notice variant="demo" title="These are demonstration case studies" onDark>
              All {demoCount} case studies below are illustrative. They are not accounts of work
              delivered to a client, no organisation described is a NEVIX client, and the outcomes
              are design intentions rather than measured results. Real case studies will be
              published here once approved and permission-cleared.
            </Notice>
          ) : undefined
        }
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/solutions">See solution patterns</Link>
            </Button>
          </>
        }
      />

      {approved.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading eyebrow="Client work" title="Approved case studies" />
          <Stagger className="mt-12">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approved.map((caseStudy) => (
                <StaggerItem as="li" key={caseStudy.slug}>
                  <CaseStudyCard caseStudy={caseStudy} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Demonstration content"
          title="Worked examples"
          description="Each of these walks through a realistic problem end to end: the constraints, the approach, the architecture, what we would implement and what we would expect to learn."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies
              .filter((c) => c.kind === 'demo')
              .map((caseStudy) => (
                <StaggerItem as="li" key={caseStudy.slug}>
                  <CaseStudyCard caseStudy={caseStudy} />
                </StaggerItem>
              ))}
          </ul>
        </Stagger>
      </Section>

      <CtaSection
        eyebrow="Want a reference?"
        title="Ask us directly"
        description="We will not publish a client name or a metric without permission and evidence. If you need a reference before engaging, ask — we will arrange what we are permitted to share."
        primary={ctas.talk}
        secondary={ctas.consultation}
      />
    </>
  );
}
