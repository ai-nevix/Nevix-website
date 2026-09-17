import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InsightCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { insightTags } from '@/content/insights';
import { ctas } from '@/content/site';
import { getInsightCategories, getInsights } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';
import { slugToLabel } from '@/lib/utils';

/**
 * Insights filtered by tag.
 *
 * Tag pages are `noIndex`: they are a navigation convenience, and indexing them creates many thin
 * pages whose content overlaps the category pages and the article itself.
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return insightTags.map((tag) => ({ slug: tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return buildMetadata({
    title: `${slugToLabel(slug)} insights`,
    description: `VASTRIX articles tagged ${slugToLabel(slug)}.`,
    path: `/insights/tag/${slug}`,
    seo: { noIndex: true },
  });
}

export default async function InsightTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [insights, categories] = await Promise.all([
    getInsights({ tag: slug }),
    getInsightCategories(),
  ]);

  if (insights.length === 0) notFound();

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Insights', href: '/insights' },
          { name: slugToLabel(slug), href: `/insights/tag/${slug}` },
        ]}
        eyebrow="Tagged"
        title={slugToLabel(slug)}
        description={`${insights.length} ${insights.length === 1 ? 'article' : 'articles'} tagged ${slugToLabel(slug)}.`}
        actions={
          <Button asChild size="lg" variant="outlineOnDark">
            <Link href="/insights">All insights</Link>
          </Button>
        }
      />

      <Section tone="light" size="lg">
        <h2 className="text-display-sm text-neutral-900">Articles</h2>

        <Stagger className="mt-12">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <StaggerItem as="li" key={insight.slug}>
                <InsightCard
                  insight={insight}
                  categoryName={categories.find((c) => c.slug === insight.categorySlug)?.name}
                />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      <CtaSection primary={ctas.talk} secondary={ctas.consultation} />
    </>
  );
}
