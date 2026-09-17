import type { MetadataRoute } from 'next';

import { siteUrl } from '@/content/site';
import {
  getCaseStudies,
  getIndustries,
  getInsightCategories,
  getInsights,
  getProducts,
  getServiceCategories,
  getServices,
  getSolutions,
} from '@/lib/cms';

/**
 * XML sitemap (specification §23.2).
 *
 * Only indexable content is listed. Deliberately excluded:
 * - demo case studies and placeholder products, which are `noIndex` because they are not
 *   verified company information (specification §31)
 * - `/search`, which produces thin, infinitely variable pages
 * - `/legal/*` drafts, until legal review removes the draft banner
 * - insight tag pages, which duplicate category and article content
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    categories,
    services,
    solutions,
    industries,
    products,
    caseStudies,
    insights,
    insightCategories,
  ] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getSolutions(),
    getIndustries(),
    getProducts(),
    getCaseStudies(),
    getInsights(),
    getInsightCategories(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/solutions`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/industries`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/insights`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/services/${category.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}/services/${service.categorySlug}/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const solutionRoutes: MetadataRoute.Sitemap = solutions.map((solution) => ({
    url: `${siteUrl}/solutions/${solution.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const industryRoutes: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${siteUrl}/industries/${industry.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Placeholder products are noIndex; listing them in the sitemap would contradict that.
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => !product.isPlaceholder && !product.seo.noIndex)
    .map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  // Demo case studies are noIndex for the same reason.
  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies
    .filter((caseStudy) => caseStudy.kind === 'approved' && !caseStudy.seo.noIndex)
    .map((caseStudy) => ({
      url: `${siteUrl}/case-studies/${caseStudy.slug}`,
      lastModified: new Date(caseStudy.publishedAt),
      changeFrequency: 'yearly',
      priority: 0.6,
    }));

  const insightRoutes: MetadataRoute.Sitemap = insights
    .filter((insight) => !insight.seo.noIndex)
    .map((insight) => ({
      url: `${siteUrl}/insights/${insight.slug}`,
      lastModified: new Date(insight.updatedAt ?? insight.publishedAt),
      changeFrequency: 'yearly',
      priority: 0.6,
    }));

  const insightCategoryRoutes: MetadataRoute.Sitemap = insightCategories
    .filter((category) => insights.some((i) => i.categorySlug === category.slug))
    .map((category) => ({
      url: `${siteUrl}/insights/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...serviceRoutes,
    ...solutionRoutes,
    ...industryRoutes,
    ...productRoutes,
    ...caseStudyRoutes,
    ...insightRoutes,
    ...insightCategoryRoutes,
  ];
}
