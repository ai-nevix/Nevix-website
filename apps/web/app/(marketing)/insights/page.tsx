import Link from 'next/link';

import { InsightCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { ctas } from '@/content/site';
import { getInsightCategories, getInsights } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatDate, readingMinutes, toDateTimeAttribute } from '@/lib/utils';

/**
 * Insights index — specification §9.3, instruction §24.
 *
 * DUMMY-DATA: DD-007 — seed articles pending real editorial content in the CMS.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Insights',
  description:
    'Practical writing from the VASTRIX engineering team on applied AI, automation, data engineering, architecture and deployment.',
  path: '/insights',
});

export default async function InsightsPage() {
  const [insights, categories] = await Promise.all([getInsights(), getInsightCategories()]);

  const [featured, ...rest] = insights;
  const usedCategories = categories.filter((category) =>
    insights.some((insight) => insight.categorySlug === category.slug),
  );
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name;

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Insights', href: '/insights' }]}
        eyebrow="Insights"
        title="Notes from the engineering team"
        description="Writing about the problems we actually hit — evaluation, process discovery, pipeline reliability, deployment topology. No predictions and no vendor comparisons."
        actions={
          <Button asChild size="lg" variant="outlineOnDark">
            <Link href="#articles">Browse articles</Link>
          </Button>
        }
      />

      {insights.length === 0 ? (
        <Section tone="light" size="lg">
          <EmptyState
            title="No articles published yet"
            description="Insights will appear here once the first articles are published."
            action={
              <Button asChild variant="secondary">
                <Link href="/services">Explore our services</Link>
              </Button>
            }
          />
        </Section>
      ) : (
        <>
          {/* --- Featured ------------------------------------------------------------------------ */}
          {featured ? (
            <Section tone="light" size="lg">
              <Reveal>
                <article className="card-surface card-interactive group relative overflow-hidden">
                  <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <span className="font-semibold text-brand-700">
                          {categoryName(featured.categorySlug)}
                        </span>
                        <time dateTime={toDateTimeAttribute(featured.publishedAt)}>
                          {formatDate(featured.publishedAt)}
                        </time>
                        <span aria-hidden="true">·</span>
                        <span>
                          {featured.readingMinutes ?? readingMinutes(featured.content)} min read
                        </span>
                      </div>

                      <h2 className="mt-4 text-display-sm text-neutral-900">
                        <Link
                          href={`/insights/${featured.slug}`}
                          className='after:absolute after:inset-0 after:content-[""]'
                        >
                          {featured.title}
                        </Link>
                      </h2>

                      <p className="mt-4 text-base leading-relaxed text-neutral-600">
                        {featured.excerpt}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                      Read article
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </article>
              </Reveal>
            </Section>
          ) : null}

          {/* --- Categories ---------------------------------------------------------------------- */}
          {usedCategories.length > 0 ? (
            <Section tone="subtle" size="sm">
              <nav aria-label="Insight categories">
                <h2 className="text-eyebrow text-neutral-500 uppercase">Browse by topic</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {usedCategories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/insights/category/${category.slug}`}
                        className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Section>
          ) : null}

          {/* --- All articles -------------------------------------------------------------------- */}
          <Section tone="light" size="lg" id="articles">
            <SectionHeading eyebrow="All articles" title={`${insights.length} published`} />

            <Stagger className="mt-12">
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((insight) => (
                  <StaggerItem as="li" key={insight.slug}>
                    <InsightCard
                      insight={insight}
                      categoryName={categoryName(insight.categorySlug)}
                    />
                  </StaggerItem>
                ))}
              </ul>
            </Stagger>
          </Section>
        </>
      )}

      <CtaSection
        eyebrow="Questions about any of this?"
        title="We are happy to go deeper"
        description="If something here is relevant to a problem you are working on, get in touch. We would rather have the specific conversation than write another general article."
        primary={ctas.talk}
        secondary={ctas.consultation}
      />
    </>
  );
}
