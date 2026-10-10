import Link from 'next/link';

import { IndustryCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { ctas } from '@/content/site';
import { getIndustries } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Industries index — specification §8.1, catalogue §8.
 *
 * Content governance: these pages describe capability and sector context. They never claim
 * approvals, empanelments, registrations or certifications, and the notice states that explicitly
 * rather than relying on the absence of a claim.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Industries',
  description:
    'Sector context for NEVIX work across government and public sector, healthcare, manufacturing, finance, education and enterprise IT.',
  path: '/industries',
});

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Industries', href: '/industries' }]}
        eyebrow="Industries"
        title="Sector context that changes the engineering"
        description="Accessibility obligations, data sensitivity, integration surfaces and audit expectations differ by sector, and they shape decisions from the first architecture conversation onwards."
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

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Where we work"
          title="Six sectors"
          description="Each page sets out the operational context, the capability areas we can deliver, and the constraints that shape how we would build."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <StaggerItem as="li" key={industry.slug}>
                <IndustryCard industry={industry} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal className="mt-14">
          <Notice variant="compliance" title="What these pages do not claim">
            These pages describe capabilities NEVIX can deliver. They are not claims of sector
            approval, empanelment, registration, accreditation or certification — NEVIX does not
            currently hold sector-specific credentials, and we will not imply otherwise. If a
            procurement process requires a specific credential, raise it with us and we will answer
            accurately.
          </Notice>
        </Reveal>
      </Section>

      <CtaSection
        eyebrow="Your sector not listed?"
        title="The constraints usually rhyme"
        description="Most sectors share the same underlying problems — manual document handling, fragmented workflows, unreliable reporting. Tell us yours and we will say whether we can help."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
