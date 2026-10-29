import Link from 'next/link';
import { notFound } from 'next/navigation';

import { IndustryCard, ServiceCard, SolutionMark } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { WorkflowSteps } from '@/components/sections/process-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { SolutionGallery } from '@/components/sections/solution-gallery';
import { solutions as allSolutions, solutionStatusMeta } from '@/content/solutions';
import { ctas } from '@/content/site';
import { getIndustries, getServices, getSolutionBySlug } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allSolutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) return {};

  return buildMetadata({
    title: solution.name,
    description: solution.summary,
    path: `/solutions/${solution.slug}`,
    seo: solution.seo,
  });
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);

  if (!solution) notFound();

  const [allServices, allIndustries] = await Promise.all([getServices(), getIndustries()]);

  const relatedServices = allServices.filter((s) => solution.relatedServiceSlugs.includes(s.slug));
  const relatedIndustries = allIndustries.filter((i) =>
    (solution.relatedIndustrySlugs ?? []).includes(i.slug),
  );
  const status = solutionStatusMeta[solution.status];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Solutions', href: '/solutions' },
          { name: solution.name, href: `/solutions/${solution.slug}` },
        ]}
        eyebrow="Solution"
        title={solution.heroTitle}
        description={solution.heroDescription}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/solutions">All solutions</Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SolutionMark solution={solution} tone="onDark" />
                <p className="text-eyebrow text-cyan-brand-400 uppercase">The problem</p>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-4 text-base leading-relaxed text-neutral-200">{solution.problem}</p>
            <p className="mt-4 text-xs text-neutral-400">{status.description}</p>
          </div>
        }
      />

      {solution.statusNote ? (
        <Section tone="light" size="sm">
          <Notice variant="compliance" title="What this status means">
            {solution.statusNote}
          </Notice>
        </Section>
      ) : null}

      {/* --- Gallery --------------------------------------------------------------------------- */}
      {solution.gallery && solution.gallery.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading eyebrow="Screenshots" title="What it looks like" />
          <div className="mt-12">
            <SolutionGallery images={solution.gallery} solutionName={solution.name} />
          </div>
        </Section>
      ) : null}

      {/* --- Workflow -------------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="How it works"
            title="End to end"
            description="What happens from the moment work enters the system to the moment it leaves it."
          />
          <WorkflowSteps steps={solution.workflow} />
        </div>
      </Section>

      {/* --- Technical approach ---------------------------------------------------------------- */}
      <Section tone="brand-field" size="lg">
        <SectionHeading
          eyebrow="Technical approach"
          title="The decisions that make it hold up"
          description="These are the design choices that determine whether the system survives real operating conditions."
          onDark
        />

        <Stagger className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2">
            {solution.technicalApproach.map((item) => (
              <StaggerItem as="li" key={item}>
                <div className="card-glass h-full p-5">
                  <p className="text-base leading-relaxed text-neutral-200">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Capabilities ------------------------------------------------------------------------ */}
      <Section tone="light" size="lg">
        <SectionHeading eyebrow="Capabilities" title="What it delivers" />

        <Stagger className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2">
            {solution.illustrativeOutcomes.map((outcome) => (
              <StaggerItem as="li" key={outcome}>
                <div className="card-surface h-full p-5">
                  <p className="text-base leading-relaxed text-neutral-700">{outcome}</p>
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal className="mt-10">
          <Notice variant="illustrative" title="Illustrative — not a guarantee">
            These describe what the project is designed to achieve, at the build status shown above
            — not a promised result. NEVIX does not publish guaranteed ROI, accuracy or automation
            figures. Measurable objectives are agreed at the start of an engagement and reported
            against afterwards.
          </Notice>
        </Reveal>
      </Section>

      {/* --- Related services ------------------------------------------------------------------ */}
      {relatedServices.length > 0 ? (
        <Section tone="subtle" size="lg">
          <SectionHeading
            eyebrow="Capabilities used"
            title="Services behind this solution"
            action={
              <Button asChild variant="secondary">
                <Link href="/services">All services</Link>
              </Button>
            }
          />
          <Stagger className="mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedServices.map((service) => (
                <StaggerItem as="li" key={service.slug}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      {/* --- Related industries ---------------------------------------------------------------- */}
      {relatedIndustries.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading eyebrow="Where it applies" title="Relevant sectors" />
          <Stagger className="mt-12">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedIndustries.map((industry) => (
                <StaggerItem as="li" key={industry.slug}>
                  <IndustryCard industry={industry} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      <CtaSection
        eyebrow={solution.name}
        title="Does this describe your problem?"
        description="If it is close but not exact, that is normal. Tell us what is actually happening and we will adapt the approach or tell you it does not apply."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
