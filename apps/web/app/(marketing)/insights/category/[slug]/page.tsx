import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InsightCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { Section } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { insightCategories, insights as allInsights } from '@/content/insights';
import { ctas } from '@/content/site';
import { getInsightCategories, getInsights } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Insights filtered by category.
 *
 * Only categories that actually have published articles get a route. An empty category page is a
 * thin, duplicate-content page with nothing on it — better not to generate one at all.
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return insightCategories
    .filter((category) => allInsights.some((i) => i.categorySlug === category.slug))
    .map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getInsightCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  return buildMetadata({
    title: `${category.name} insights`,
    description: `${category.description} Articles from the VASTRIX engineering team.`,
    path: `/insights/category/${category.slug}`,
  });
}

export default async function InsightCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getInsightCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const insights = await getInsights({ categorySlug: slug });

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Insights', href: '/insights' },
          { name: category.name, href: `/insights/category/${category.slug}` },
        ]}
        eyebrow="Insights"
        title={category.name}
        description={category.description}
        actions={
          <Button asChild size="lg" variant="outlineOnDark">
            <Link href="/insights">All insights</Link>
          </Button>
        }
      />

      <Section tone="light" size="lg">
        <h2 className="text-display-sm text-neutral-900">
          {insights.length} {insights.length === 1 ? 'article' : 'articles'} in {category.name}
        </h2>

        <div className="mt-12">
          {insights.length === 0 ? (
            <EmptyState
              title={`No ${category.name} articles yet`}
              description="Nothing has been published in this topic so far."
              action={
                <Button asChild variant="secondary">
                  <Link href="/insights">Browse all insights</Link>
                </Button>
              }
            />
          ) : (
            <Stagger>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight) => (
                  <StaggerItem as="li" key={insight.slug}>
                    <InsightCard insight={insight} categoryName={category.name} />
                  </StaggerItem>
                ))}
              </ul>
            </Stagger>
          )}
        </div>
      </Section>

      <CtaSection primary={ctas.talk} secondary={ctas.consultation} />
    </>
  );
}
