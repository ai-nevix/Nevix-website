import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { ServiceCategorySlug } from '@nevix/types';

import { ServiceCard, SolutionCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { serviceCategories } from '@/content/service-categories';
import { ctas } from '@/content/site';
import { getServiceCategoryBySlug, getServices, getSolutions } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Service category page — one of the six fixed categories from specification §5.1.
 *
 * `dynamicParams = false` means only the six known slugs resolve; anything else is a 404 at the
 * routing layer rather than a runtime lookup.
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = await getServiceCategoryBySlug(slug);

  if (!category) return {};

  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/services/${category.slug}`,
    seo: category.seo,
  });
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getServiceCategoryBySlug(slug);

  if (!category) notFound();

  const [services, allSolutions] = await Promise.all([
    getServices({ categorySlug: category.slug as ServiceCategorySlug }),
    getSolutions(),
  ]);

  const serviceSlugs = new Set(services.map((s) => s.slug));
  const relatedSolutions = allSolutions
    .filter((solution) => solution.relatedServiceSlugs.some((s) => serviceSlugs.has(s)))
    .slice(0, 3);

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Services', href: '/services' },
          { name: category.name, href: `/services/${category.slug}` },
        ]}
        eyebrow={category.isCorePillar ? 'Core pillar' : 'Extended capability'}
        title={category.heroTitle}
        description={category.heroDescription}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              {/* Carries the category through so the contact form arrives pre-selected, matching
                  the behaviour of the service detail pages. */}
              <Link href={`${ctas.primary.href}?interest=${category.slug}`}>
                {ctas.primary.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="#services">
                {services.length} {services.length === 1 ? 'service' : 'services'}
              </Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-eyebrow text-cyan-brand-400 uppercase">Positioning</p>
            <p className="mt-4 text-base leading-relaxed text-neutral-200">
              {category.positioning}
            </p>
          </div>
        }
      />

      <Section tone="light" size="lg">
        <div className="max-w-3xl">
          <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">
            {category.description}
          </p>
        </div>
      </Section>

      <Section tone="subtle" size="lg" id="services">
        <SectionHeading
          eyebrow={category.name}
          title="Services in this category"
          description="Each page sets out the problem, what we do, the capabilities and use cases, the technology approach and the expected outcomes."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <StaggerItem as="li" key={service.slug}>
                <ServiceCard service={service} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {relatedSolutions.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading
            eyebrow="Applied"
            title="Solution patterns using these capabilities"
            description="How these services combine to address a specific business problem."
            action={
              <Button asChild variant="secondary">
                <Link href="/solutions">All solutions</Link>
              </Button>
            }
          />

          <Stagger className="mt-14">
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

      <CtaSection
        eyebrow={category.name}
        title={`Discuss a ${category.name.toLowerCase()} requirement`}
        description="Tell us the problem you are trying to solve and the constraints around it. We will come back with an honest view of whether this is the right capability for it."
        primary={{
          label: ctas.primary.label,
          href: `${ctas.primary.href}?interest=${category.slug}`,
        }}
        secondary={ctas.consultation}
      />
    </>
  );
}
