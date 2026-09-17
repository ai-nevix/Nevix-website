import 'server-only';

import type { SearchEntityType, SearchResult } from '@vastrix/types';

import {
  getCaseStudies,
  getIndustries,
  getInsights,
  getProducts,
  getServiceCategories,
  getServices,
  getSolutions,
} from '@/lib/cms';
import { truncate } from '@/lib/utils';

/**
 * Site search over published content (specification §17, instruction §73).
 *
 * Deliberately simple: the corpus is a few hundred short documents, so an in-memory scored scan
 * is faster than any index we could add and needs no extra infrastructure. When the corpus grows
 * enough to justify it, the natural next step is pgvector semantic search behind the same
 * `search()` signature — which is why this returns the shared `SearchResult` shape.
 *
 * Only public, published content is searched. Nothing administrative is reachable from here.
 */

interface Document {
  type: SearchEntityType;
  title: string;
  href: string;
  excerpt: string;
  /** Concatenated searchable text, lower-cased at build time. */
  haystack: string;
  /** Baseline importance, so a service outranks a tag page on an equal text match. */
  weight: number;
}

let cache: { documents: Document[]; builtAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function buildCorpus(): Promise<Document[]> {
  const [categories, services, solutions, industries, products, caseStudies, insights] =
    await Promise.all([
      getServiceCategories(),
      getServices(),
      getSolutions(),
      getIndustries(),
      getProducts(),
      getCaseStudies(),
      getInsights(),
    ]);

  const documents: Document[] = [];

  for (const category of categories) {
    documents.push({
      type: 'service-category',
      title: category.name,
      href: `/services/${category.slug}`,
      excerpt: category.positioning,
      haystack: [category.name, category.positioning, category.description, category.heroTitle]
        .join(' ')
        .toLowerCase(),
      weight: 1.3,
    });
  }

  for (const service of services) {
    documents.push({
      type: 'service',
      title: service.name,
      href: `/services/${service.categorySlug}/${service.slug}`,
      excerpt: service.shortDescription,
      haystack: [
        service.name,
        service.shortDescription,
        service.problemStatement,
        service.whatWeDo,
        ...service.capabilities,
        ...service.useCases,
        ...(service.technologies ?? []),
      ]
        .join(' ')
        .toLowerCase(),
      weight: 1.2,
    });
  }

  for (const solution of solutions) {
    documents.push({
      type: 'solution',
      title: solution.name,
      href: `/solutions/${solution.slug}`,
      excerpt: solution.summary,
      haystack: [
        solution.name,
        solution.problem,
        solution.summary,
        ...solution.technicalApproach,
        ...solution.workflow.map((s) => `${s.title} ${s.description}`),
      ]
        .join(' ')
        .toLowerCase(),
      weight: 1.2,
    });
  }

  for (const industry of industries) {
    documents.push({
      type: 'industry',
      title: industry.name,
      href: `/industries/${industry.slug}`,
      excerpt: industry.summary,
      haystack: [
        industry.name,
        industry.summary,
        industry.context,
        ...industry.capabilityAreas.map((a) => `${a.title} ${a.description ?? ''}`),
      ]
        .join(' ')
        .toLowerCase(),
      weight: 1.0,
    });
  }

  for (const product of products) {
    documents.push({
      type: 'product',
      title: product.name,
      href: `/products/${product.slug}`,
      excerpt: product.summary,
      haystack: [product.name, product.tagline, product.summary, product.problem]
        .join(' ')
        .toLowerCase(),
      weight: 0.8,
    });
  }

  for (const caseStudy of caseStudies) {
    documents.push({
      type: 'case-study',
      title: caseStudy.kind === 'demo' ? `${caseStudy.title} (Demo)` : caseStudy.title,
      href: `/case-studies/${caseStudy.slug}`,
      excerpt: caseStudy.summary,
      haystack: [
        caseStudy.title,
        caseStudy.summary,
        caseStudy.problem,
        caseStudy.approach,
        ...caseStudy.technologies,
      ]
        .join(' ')
        .toLowerCase(),
      weight: 0.9,
    });
  }

  for (const insight of insights) {
    documents.push({
      type: 'insight',
      title: insight.title,
      href: `/insights/${insight.slug}`,
      excerpt: insight.excerpt,
      haystack: [insight.title, insight.excerpt, insight.content, ...insight.tags]
        .join(' ')
        .toLowerCase(),
      weight: 1.0,
    });
  }

  return documents;
}

async function getCorpus(): Promise<Document[]> {
  if (cache && Date.now() - cache.builtAt < CACHE_TTL_MS) return cache.documents;
  const documents = await buildCorpus();
  cache = { documents, builtAt: Date.now() };
  return documents;
}

/**
 * Scores a document against the query terms.
 *
 * A title match is worth far more than a body match, and every term must appear somewhere —
 * otherwise a two-word query returns everything that matches either word, which is noise.
 */
function score(document: Document, terms: string[]): number {
  const title = document.title.toLowerCase();
  let total = 0;

  for (const term of terms) {
    const inTitle = title.includes(term);
    const bodyMatches = document.haystack.split(term).length - 1;

    if (!inTitle && bodyMatches === 0) return 0;

    if (inTitle) total += title.startsWith(term) ? 12 : 8;
    total += Math.min(bodyMatches, 6);
  }

  return total * document.weight;
}

export async function search(query: string, limit = 25): Promise<SearchResult[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9+#.-]/g, ''))
    .filter((t) => t.length >= 2);

  if (terms.length === 0) return [];

  const documents = await getCorpus();

  return documents
    .map((document) => ({ document, value: score(document, terms) }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map(({ document, value }) => ({
      type: document.type,
      title: document.title,
      excerpt: truncate(document.excerpt, 180),
      href: document.href,
      score: Math.round(value * 10) / 10,
    }));
}

export const SEARCH_TYPE_LABELS: Record<SearchEntityType, string> = {
  service: 'Service',
  'service-category': 'Service category',
  solution: 'Solution',
  industry: 'Industry',
  product: 'Product',
  'case-study': 'Case study',
  insight: 'Insight',
};
