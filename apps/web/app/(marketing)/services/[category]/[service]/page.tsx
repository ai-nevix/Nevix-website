import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CaseStudyCard, SolutionCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Faq } from '@/components/sections/faq';
import { PageHero } from '@/components/sections/page-hero';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { about } from '@/content/about';
import { services as allServices } from '@/content/services';
import { ctas } from '@/content/site';
import {
  getCaseStudies,
  getServiceBySlug,
  getServiceCategoryBySlug,
  getServices,
  getSolutions,
} from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqSchema, serviceSchema } from '@/lib/seo/structured-data';

/**
 * Service detail page.
 *
 * Section order is fixed by catalogue §12 / specification §7.1:
 * hero → problem → what we do → capabilities → use cases → technology approach → how we work →
 * expected outcomes → case study → FAQ → CTA.
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allServices.map((service) => ({
    category: service.categorySlug,
    service: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}) {
  const { category, service: serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);

  if (!service || service.categorySlug !== category) return {};

  return buildMetadata({
    title: service.name,
    description: service.shortDescription,
    path: `/services/${category}/${service.slug}`,
    seo: service.seo,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}) {
  const { category: categorySlug, service: serviceSlug } = await params;

  const [service, category] = await Promise.all([
    getServiceBySlug(serviceSlug),
    getServiceCategoryBySlug(categorySlug),
  ]);

  // Guard against a service being reached under the wrong category path, which would otherwise
  // create a duplicate URL for the same content.
  if (!service || !category || service.categorySlug !== category.slug) notFound();

  const [allSolutions, allCaseStudies, siblingServices] = await Promise.all([
    getSolutions(),
    getCaseStudies(),
    getServices({ categorySlug: category.slug }),
  ]);

  const relatedSolutions = allSolutions.filter((s) =>
    (service.solutionSlugs ?? []).includes(s.slug),
  );
  const relatedCaseStudies = allCaseStudies.filter((c) =>
    (service.caseStudySlugs ?? []).includes(c.slug),
  );
  const siblings = siblingServices.filter((s) => s.slug !== service.slug).slice(0, 6);

  return (
    <>
      <JsonLd id={`service-${service.slug}`} data={serviceSchema(service, category)} />
      {service.faq?.length ? (
        <JsonLd id={`faq-${service.slug}`} data={faqSchema(service.faq)} />
      ) : null}

      <PageHero
        breadcrumbs={[
          { name: 'Services', href: '/services' },
          { name: category.name, href: `/services/${category.slug}` },
          { name: service.name, href: `/services/${category.slug}/${service.slug}` },
        ]}
        eyebrow={category.name}
        title={service.heroTitle}
        description={service.heroDescription}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={`${ctas.primary.href}?interest=${category.slug}`}>
                {ctas.primary.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href={`/services/${category.slug}`}>All {category.name}</Link>
            </Button>
          </>
        }
        aside={
          service.technologies?.length ? (
            <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-eyebrow text-cyan-brand-400 uppercase">Typical stack</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {service.technologies.map((tech) => (
                  <li key={tech}>
                    <Badge tone="onDark">{tech}</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-neutral-500">
                Technology is selected per engagement. This lists what we most often use for this
                service, not a fixed requirement.
              </p>
            </div>
          ) : undefined
        }
      />

      {/* --- Problem + what we do -------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-eyebrow text-brand-700 uppercase">The problem we solve</p>
            <p className="mt-5 text-lg leading-relaxed text-neutral-700 sm:text-xl">
              {service.problemStatement}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-eyebrow text-brand-700 uppercase">What we do</p>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
              {service.whatWeDo}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* --- Capabilities + use cases ---------------------------------------------------------- */}
      <Section tone="subtle" size="lg">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Capabilities"
              title="What you get"
              description="The deliverables this service typically produces."
              as="h2"
            />
            <Stagger className="mt-9">
              <ul className="flex flex-col gap-3">
                {service.capabilities.map((capability) => (
                  <StaggerItem as="li" key={capability} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
                      <Check className="size-3 text-white" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-base text-neutral-700">{capability}</span>
                  </StaggerItem>
                ))}
              </ul>
            </Stagger>
          </div>

          <div>
            <SectionHeading
              eyebrow="Use cases"
              title="Where it applies"
              description="Situations where this service is typically the right fit."
              as="h2"
            />
            <Stagger className="mt-9">
              <ul className="grid gap-3 sm:grid-cols-2">
                {service.useCases.map((useCase) => (
                  <StaggerItem as="li" key={useCase}>
                    <div className="card-surface h-full px-4 py-3.5">
                      <span className="text-sm font-semibold text-neutral-800">{useCase}</span>
                    </div>
                  </StaggerItem>
                ))}
              </ul>
            </Stagger>
          </div>
        </div>
      </Section>

      {/* --- Technology approach --------------------------------------------------------------- */}
      {service.technologyApproach ? (
        <Section tone="brand-field" size="lg">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-cyan-brand-400 uppercase">Technology approach</p>
            <p className="mt-6 text-lg leading-relaxed text-neutral-200 sm:text-xl">
              {service.technologyApproach}
            </p>
          </div>
        </Section>
      ) : null}

      {/* --- How we work ----------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="How we work"
          title="The same lifecycle, every engagement"
          description="Discover → Define → Prototype → Build → Deploy → Evolve."
        />
        <ProcessTimeline steps={about.lifecycle} className="mt-12" />
      </Section>

      {/* --- Expected outcomes ----------------------------------------------------------------- */}
      {service.outcomes?.length ? (
        <Section tone="subtle" size="lg">
          <SectionHeading
            eyebrow="Expected outcomes"
            title="What changes when this is done"
            description="What the delivered system does differently. Specific numbers are agreed per engagement and measured — we do not quote them in advance."
          />
          <Stagger className="mt-12">
            <ul className="grid gap-5 sm:grid-cols-2">
              {service.outcomes.map((outcome) => (
                <StaggerItem as="li" key={outcome}>
                  <div className="card-surface h-full p-5">
                    <p className="text-base leading-relaxed text-neutral-700">{outcome}</p>
                  </div>
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      {/* --- Related solutions ----------------------------------------------------------------- */}
      {relatedSolutions.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading eyebrow="Applied" title="Solution patterns using this service" />
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

      {/* --- Related case studies -------------------------------------------------------------- */}
      {relatedCaseStudies.length > 0 ? (
        <Section tone="subtle" size="lg">
          <SectionHeading
            eyebrow="Example"
            title="How we approach it"
            description="Demonstration case studies showing the approach and the trade-offs. These are labelled illustrative examples, not delivered client work."
          />
          <Stagger className="mt-12">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCaseStudies.map((caseStudy) => (
                <StaggerItem as="li" key={caseStudy.slug}>
                  <CaseStudyCard caseStudy={caseStudy} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      {/* --- FAQ ------------------------------------------------------------------------------- */}
      {service.faq?.length ? (
        <Section tone="light" size="lg">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
            <SectionHeading
              eyebrow="Questions"
              title="Frequently asked"
              description="If yours is not answered here, ask us directly."
            />
            <Faq items={service.faq} />
          </div>
        </Section>
      ) : null}

      {/* --- Sibling services ------------------------------------------------------------------ */}
      {siblings.length > 0 ? (
        <Section tone="subtle" size="md">
          <SectionHeading eyebrow={category.name} title="Other services in this category" as="h2" />
          <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  href={`/services/${category.slug}/${sibling.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-300"
                >
                  <span className="text-sm font-semibold text-neutral-800 group-hover:text-brand-700">
                    {sibling.name}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CtaSection
        eyebrow={service.name}
        title={`Discuss ${service.name.toLowerCase()}`}
        description="Tell us what you are working with — the systems, the volumes, the constraints — and what a good outcome would look like. We will tell you whether this is the right approach."
        primary={{
          label: ctas.primary.label,
          href: `${ctas.primary.href}?interest=${category.slug}`,
        }}
        secondary={ctas.consultation}
      />
    </>
  );
}
