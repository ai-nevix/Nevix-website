import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InsightCard } from '@/components/cards';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CtaSection } from '@/components/sections/cta-section';
import { Markdown } from '@/components/sections/markdown';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Section, SectionHeading } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { insights as allInsights } from '@/content/insights';
import { ctas } from '@/content/site';
import { getAuthorBySlug, getInsightBySlug, getInsightCategories, getInsights } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';
import { articleSchema } from '@/lib/seo/structured-data';
import { formatDate, readingMinutes, slugToLabel, toDateTimeAttribute } from '@/lib/utils';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allInsights.map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);
  if (!insight) return {};

  const author = await getAuthorBySlug(insight.authorSlug);

  return buildMetadata({
    title: insight.title,
    description: insight.excerpt,
    path: `/insights/${insight.slug}`,
    seo: insight.seo,
    type: 'article',
    publishedTime: insight.publishedAt,
    modifiedTime: insight.updatedAt ?? insight.publishedAt,
    authors: author ? [author.name] : undefined,
    tags: insight.tags,
  });
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);

  if (!insight) notFound();

  const [author, categories, siblings] = await Promise.all([
    getAuthorBySlug(insight.authorSlug),
    getInsightCategories(),
    getInsights({ limit: 4 }),
  ]);

  const category = categories.find((c) => c.slug === insight.categorySlug);
  const related = siblings.filter((s) => s.slug !== insight.slug).slice(0, 3);
  const minutes = insight.readingMinutes ?? readingMinutes(insight.content);

  return (
    <>
      <JsonLd id={`article-${insight.slug}`} data={articleSchema(insight, author)} />

      <article>
        {/* --- Article header ------------------------------------------------------------------- */}
        <header className="brand-field dark-section">
          <Container size="prose">
            <div className="py-14 sm:py-16 lg:py-20">
              <Breadcrumbs
                entries={[
                  { name: 'Insights', href: '/insights' },
                  { name: insight.title, href: `/insights/${insight.slug}` },
                ]}
                onDark
              />

              {category ? (
                <Link
                  href={`/insights/category/${category.slug}`}
                  className="mt-9 inline-block text-eyebrow text-cyan-brand-400 uppercase hover:text-cyan-brand-300"
                >
                  {category.name}
                </Link>
              ) : null}

              <h1 className="mt-4 text-display-lg text-white">{insight.title}</h1>

              <p className="mt-6 text-lg leading-relaxed text-neutral-300">{insight.excerpt}</p>

              <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-6 text-sm text-neutral-400">
                {/* DUMMY-DATA: DD-008 — team account rather than an invented individual. */}
                {author ? <span className="font-semibold text-white">{author.name}</span> : null}
                <time dateTime={toDateTimeAttribute(insight.publishedAt)}>
                  {formatDate(insight.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{minutes} min read</span>
                {insight.updatedAt ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Updated{' '}
                      <time dateTime={toDateTimeAttribute(insight.updatedAt)}>
                        {formatDate(insight.updatedAt)}
                      </time>
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </Container>
        </header>

        {/* --- Article body --------------------------------------------------------------------- */}
        <Section tone="light" size="lg" containerSize="prose">
          <Markdown content={insight.content} />

          {insight.tags.length > 0 ? (
            <div className="mt-14 border-t border-neutral-200 pt-8">
              <h2 className="text-eyebrow text-neutral-500 uppercase">Tags</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/insights/tag/${tag}`}>
                      <Badge tone="neutral" className="transition-colors hover:border-brand-300">
                        {slugToLabel(tag)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {author ? (
            <div className="mt-10 rounded-(--radius-card) border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-sm font-bold text-neutral-900">{author.name}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{author.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{author.bio}</p>
            </div>
          ) : null}
        </Section>
      </article>

      {related.length > 0 ? (
        <Section tone="subtle" size="lg">
          <SectionHeading eyebrow="Keep reading" title="More from the team" as="h2" />
          <Stagger className="mt-12">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem as="li" key={item.slug}>
                  <InsightCard
                    insight={item}
                    categoryName={categories.find((c) => c.slug === item.categorySlug)?.name}
                  />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      <CtaSection
        eyebrow="Working on something like this?"
        title="We would rather have the specific conversation"
        description="If this article is relevant to a problem you are dealing with, tell us about it. The general case is always less useful than yours."
        primary={ctas.talk}
        secondary={ctas.consultation}
      />
    </>
  );
}
