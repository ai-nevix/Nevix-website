import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ServiceCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { DemoCaseStudyNotice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { caseStudies as allCaseStudies } from '@/content/case-studies';
import { ctas } from '@/content/site';
import { getCaseStudyBySlug, getIndustryBySlug, getServices } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';
import { caseStudySchema } from '@/lib/seo/structured-data';
import { formatDate, toDateTimeAttribute } from '@/lib/utils';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allCaseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) return {};

  return buildMetadata({
    // The demo label is part of the title so it appears in the browser tab and any share preview,
    // not only in the page body.
    title: caseStudy.kind === 'demo' ? `${caseStudy.title} (Demo Case Study)` : caseStudy.title,
    description: caseStudy.summary,
    path: `/case-studies/${caseStudy.slug}`,
    seo: caseStudy.seo,
  });
}

/** Ordered prose sections shared by every case study, rendered as a numbered narrative. */
function NarrativeBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="border-t border-neutral-200 pt-10 first:border-t-0 first:pt-0">
      <p className="text-eyebrow text-brand-700 uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-display-sm text-neutral-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </Reveal>
  );
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) notFound();

  const [industry, allServices] = await Promise.all([
    getIndustryBySlug(caseStudy.industrySlug),
    getServices(),
  ]);

  const relatedServices = allServices.filter((s) => caseStudy.relatedServiceSlugs.includes(s.slug));

  return (
    <>
      <JsonLd id={`case-study-${caseStudy.slug}`} data={caseStudySchema(caseStudy)} />

      <PageHero
        breadcrumbs={[
          { name: 'Case Studies', href: '/case-studies' },
          { name: caseStudy.title, href: `/case-studies/${caseStudy.slug}` },
        ]}
        eyebrow={caseStudy.kind === 'demo' ? 'Demo Case Study' : 'Case Study'}
        title={caseStudy.title}
        description={caseStudy.summary}
        /* DUMMY-DATA: DD-001 — the disclosure appears above the fold, not in a footnote. */
        notice={caseStudy.kind === 'demo' ? <DemoCaseStudyNotice onDark /> : undefined}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/case-studies">All case studies</Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <dl className="flex flex-col gap-5 text-sm">
              <div>
                <dt className="text-eyebrow text-cyan-brand-400 uppercase">Sector</dt>
                <dd className="mt-2 text-white">{industry?.name ?? 'Cross-sector'}</dd>
              </div>
              <div>
                <dt className="text-eyebrow text-cyan-brand-400 uppercase">Client</dt>
                {/* Never fabricated. Absent unless permission has been granted (catalogue §16). */}
                <dd className="mt-2 text-neutral-400">
                  {caseStudy.client ?? 'Not applicable — demonstration content'}
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow text-cyan-brand-400 uppercase">Published</dt>
                <dd className="mt-2 text-neutral-400">
                  <time dateTime={toDateTimeAttribute(caseStudy.publishedAt)}>
                    {formatDate(caseStudy.publishedAt)}
                  </time>
                </dd>
              </div>
            </dl>
          </div>
        }
      />

      <Section tone="light" size="lg" containerSize="prose">
        <div className="flex flex-col gap-10">
          <NarrativeBlock eyebrow="01" title="The problem">
            <p className="prose-vastrix">{caseStudy.problem}</p>
          </NarrativeBlock>

          <NarrativeBlock eyebrow="02" title="Constraints">
            <ul className="prose-vastrix list-disc">
              {caseStudy.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </NarrativeBlock>

          <NarrativeBlock eyebrow="03" title="Approach">
            <p className="prose-vastrix">{caseStudy.approach}</p>
          </NarrativeBlock>

          <NarrativeBlock eyebrow="04" title="Architecture">
            <ul className="prose-vastrix list-disc">
              {caseStudy.architecture.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </NarrativeBlock>

          <NarrativeBlock eyebrow="05" title="Implementation">
            <ol className="prose-vastrix list-decimal">
              {caseStudy.implementation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </NarrativeBlock>
        </div>
      </Section>

      {/* --- Outcomes ---------------------------------------------------------------------------- */}
      <Section tone="brand-field" size="lg">
        <SectionHeading
          eyebrow="06 — Outcomes"
          title="What the system does differently"
          description={
            caseStudy.kind === 'demo'
              ? 'These are the design intentions of the approach described above. Because this is demonstration content, they are qualitative — we do not publish numbers we have not measured.'
              : undefined
          }
          onDark
        />

        <Stagger className="mt-12">
          <ul className="grid gap-5 sm:grid-cols-2">
            {caseStudy.outcomes.map((outcome) => (
              <StaggerItem as="li" key={outcome.label}>
                <div className="card-glass h-full p-6">
                  <p className="text-eyebrow text-cyan-brand-400 uppercase">{outcome.label}</p>
                  <p className="mt-3 text-base leading-relaxed text-white">{outcome.value}</p>
                  {outcome.evidence ? (
                    <p className="mt-3 border-t border-white/10 pt-3 text-xs text-neutral-500">
                      Evidence: {outcome.evidence}
                    </p>
                  ) : null}
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Lessons ----------------------------------------------------------------------------- */}
      {caseStudy.lessonsLearned?.length ? (
        <Section tone="light" size="lg" containerSize="prose">
          <p className="text-eyebrow text-brand-700 uppercase">07 — Lessons learned</p>
          <h2 className="mt-3 text-display-sm text-neutral-900">
            What we would tell the next team
          </h2>
          <ul className="prose-vastrix mt-6 list-disc">
            {caseStudy.lessonsLearned.map((lesson) => (
              <li key={lesson}>{lesson}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* --- Technology -------------------------------------------------------------------------- */}
      <Section tone="subtle" size="md">
        <SectionHeading eyebrow="Technology" title="What this was built with" as="h2" />
        <Reveal className="mt-8">
          <ul className="flex flex-wrap gap-2.5">
            {caseStudy.technologies.map((tech) => (
              <li key={tech}>
                <Badge tone="brand">{tech}</Badge>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {relatedServices.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading eyebrow="Capabilities used" title="Services behind this work" />
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
        eyebrow="Recognise this problem?"
        title="Tell us what yours looks like"
        description="The specifics will differ. The discovery questions rarely do — what happens now, what it costs, and what would have to be true for a different approach to work."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
