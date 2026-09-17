import { Check } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ServiceCard, SolutionCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { NoCredentialsNotice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { industries as allIndustries } from '@/content/industries';
import { ctas } from '@/content/site';
import { getIndustryBySlug, getServices, getSolutions } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allIndustries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};

  return buildMetadata({
    title: industry.name,
    description: industry.summary,
    path: `/industries/${industry.slug}`,
    seo: industry.seo,
  });
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);

  if (!industry) notFound();

  const [allServices, allSolutions] = await Promise.all([getServices(), getSolutions()]);

  const relatedServices = allServices.filter((s) => industry.relatedServiceSlugs.includes(s.slug));
  const relatedSolutions = allSolutions.filter((s) =>
    industry.relatedSolutionSlugs.includes(s.slug),
  );

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Industries', href: '/industries' },
          { name: industry.name, href: `/industries/${industry.slug}` },
        ]}
        eyebrow="Industry"
        title={industry.heroTitle}
        description={industry.heroDescription}
        notice={
          industry.requiresComplianceNotice ? (
            <NoCredentialsNotice sector={industry.name} onDark />
          ) : undefined
        }
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/industries">All industries</Link>
            </Button>
          </>
        }
      />

      {/* --- Context --------------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <SectionHeading eyebrow="Context" title="What shapes the work here" />
          <Reveal>
            <p className="text-lg leading-relaxed text-neutral-700 sm:text-xl">
              {industry.context}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* --- Capability areas ------------------------------------------------------------------ */}
      <Section tone="subtle" size="lg">
        <SectionHeading eyebrow="Capability areas" title="What we can build for this sector" />
        <Stagger className="mt-12">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industry.capabilityAreas.map((area) => (
              <StaggerItem as="li" key={area.title}>
                <div className="card-surface h-full p-6">
                  <h3 className="text-base font-bold tracking-tight text-neutral-900">
                    {area.title}
                  </h3>
                  {area.description ? (
                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                      {area.description}
                    </p>
                  ) : null}
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Considerations -------------------------------------------------------------------- */}
      <Section tone="brand-field" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="How we approach it"
            title="Constraints we design around"
            description="These are not optional extras added at the end. They change the architecture."
            onDark
          />
          <Stagger>
            <ul className="flex flex-col gap-4">
              {industry.considerations.map((consideration) => (
                <StaggerItem as="li" key={consideration} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-brand-500/20">
                    <Check
                      className="size-3 text-cyan-brand-300"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-base leading-relaxed text-neutral-300">
                    {consideration}
                  </span>
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </div>
      </Section>

      {/* --- Related solutions ----------------------------------------------------------------- */}
      {relatedSolutions.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading
            eyebrow="Applied"
            title="Solution patterns for this sector"
            action={
              <Button asChild variant="secondary">
                <Link href="/solutions">All solutions</Link>
              </Button>
            }
          />
          <Stagger className="mt-12">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolutions.map((solution) => (
                <StaggerItem as="li" key={solution.slug}>
                  <SolutionCard solution={solution} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      {/* --- Related services ------------------------------------------------------------------ */}
      {relatedServices.length > 0 ? (
        <Section tone="subtle" size="lg">
          <SectionHeading eyebrow="Capabilities" title="Relevant services" />
          <Stagger className="mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((service) => (
                <StaggerItem as="li" key={service.slug}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      <CtaSection
        eyebrow={industry.name}
        title="Discuss a requirement in this sector"
        description="Tell us the process, the systems involved and the constraints you are working under. We will tell you what is feasible and what is not."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
