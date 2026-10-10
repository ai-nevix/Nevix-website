import type {
  Author,
  CaseStudy,
  Industry,
  Insight,
  InsightCategory,
  Product,
  Service,
  ServiceCategory,
  ServiceCategorySlug,
  Solution,
} from '@nevix/types';

import { getServerEnv } from '@/lib/env';

import { localProvider } from './local-provider';
import { ContentUnavailableError, type ContentProvider } from './types';

/**
 * Strapi Community Edition content provider (specification §15).
 *
 * Design notes:
 * - The API token is read server-side only and sent as a bearer header. It never reaches a
 *   browser bundle.
 * - Responses are unwrapped from Strapi's `{ data, meta }` envelope and flattened into the shared
 *   domain types, so components never see Strapi's shape.
 * - A failed request raises `ContentUnavailableError` rather than returning empty data, so a CMS
 *   outage renders an explicit error state instead of a page that looks intentionally blank.
 * - `STRAPI_FALLBACK_TO_LOCAL` lets a deployment degrade to local content instead of failing the
 *   page. It is off by default: silently serving different content than the CMS holds is a worse
 *   failure mode than an honest error for most deployments.
 */

const DEFAULT_TIMEOUT_MS = 8000;

interface StrapiEnvelope<T> {
  data: T;
  meta?: unknown;
}

/** Strapi v5 returns flattened attributes; v4 nests them under `attributes`. Handle both. */
function flatten<T extends Record<string, unknown>>(entry: Record<string, unknown>): T {
  if (entry && typeof entry === 'object' && 'attributes' in entry) {
    const { attributes, ...rest } = entry as { attributes: Record<string, unknown> };
    return { ...rest, ...attributes } as T;
  }
  return entry as T;
}

async function strapiFetch<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const env = getServerEnv();
  const base = env.CMS_URL?.replace(/\/$/, '');

  if (!base) {
    throw new ContentUnavailableError('CMS_URL is not configured.');
  }

  const url = new URL(`${base}/api${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(env.CMS_API_TOKEN ? { Authorization: `Bearer ${env.CMS_API_TOKEN}` } : {}),
      },
      signal: controller.signal,
      next: { revalidate: env.CONTENT_REVALIDATE_SECONDS, tags: ['cms'] },
    });

    if (!response.ok) {
      // The body may contain internal detail; the status alone is what callers need.
      throw new ContentUnavailableError(
        `CMS request failed: ${response.status} ${response.statusText} for ${path}`,
      );
    }

    const body = (await response.json()) as StrapiEnvelope<T>;
    return body.data;
  } catch (error) {
    if (error instanceof ContentUnavailableError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ContentUnavailableError(
        `CMS request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
        error,
      );
    }
    throw new ContentUnavailableError(`CMS request failed for ${path}`, error);
  } finally {
    clearTimeout(timeout);
  }
}

const shouldFallback = () => process.env.STRAPI_FALLBACK_TO_LOCAL === 'true';

/**
 * Runs a CMS query, optionally degrading to local content.
 * The warning is deliberately loud: serving fallback content silently is how a stale site goes
 * unnoticed for weeks.
 */
async function withFallback<T>(
  operation: string,
  run: () => Promise<T>,
  fallback: () => Promise<T>,
) {
  try {
    return await run();
  } catch (error) {
    if (shouldFallback()) {
      console.warn(
        `[cms] ${operation} failed, falling back to local content. ${(error as Error).message}`,
      );
      return fallback();
    }
    throw error;
  }
}

async function collection<T extends Record<string, unknown>>(
  path: string,
  params?: Record<string, string>,
): Promise<T[]> {
  const raw = await strapiFetch<Record<string, unknown>[]>(path, {
    'pagination[pageSize]': '100',
    populate: '*',
    sort: 'order:asc',
    ...params,
  });
  return (raw ?? []).map((entry) => flatten<T>(entry));
}

async function single<T extends Record<string, unknown>>(
  path: string,
  slug: string,
): Promise<T | null> {
  const raw = await strapiFetch<Record<string, unknown>[]>(path, {
    'filters[slug][$eq]': slug,
    populate: '*',
    'pagination[pageSize]': '1',
  });
  const first = raw?.[0];
  return first ? flatten<T>(first) : null;
}

export const strapiProvider: ContentProvider = {
  name: 'strapi',

  getServiceCategories: () =>
    withFallback(
      'getServiceCategories',
      () => collection<ServiceCategory & Record<string, unknown>>('/service-categories'),
      () => localProvider.getServiceCategories(),
    ) as Promise<ServiceCategory[]>,

  getServiceCategoryBySlug: (slug) =>
    withFallback(
      'getServiceCategoryBySlug',
      () => single<ServiceCategory & Record<string, unknown>>('/service-categories', slug),
      () => localProvider.getServiceCategoryBySlug(slug),
    ) as Promise<ServiceCategory | null>,

  getServices: (options) =>
    withFallback(
      'getServices',
      () =>
        collection<Service & Record<string, unknown>>(
          '/services',
          options?.categorySlug
            ? { 'filters[category][slug][$eq]': options.categorySlug }
            : undefined,
        ),
      () => localProvider.getServices(options),
    ) as Promise<Service[]>,

  getServiceBySlug: (slug) =>
    withFallback(
      'getServiceBySlug',
      () => single<Service & Record<string, unknown>>('/services', slug),
      () => localProvider.getServiceBySlug(slug),
    ) as Promise<Service | null>,

  getSolutions: () =>
    withFallback(
      'getSolutions',
      () => collection<Solution & Record<string, unknown>>('/solutions'),
      () => localProvider.getSolutions(),
    ) as Promise<Solution[]>,

  getSolutionBySlug: (slug) =>
    withFallback(
      'getSolutionBySlug',
      () => single<Solution & Record<string, unknown>>('/solutions', slug),
      () => localProvider.getSolutionBySlug(slug),
    ) as Promise<Solution | null>,

  getIndustries: () =>
    withFallback(
      'getIndustries',
      () => collection<Industry & Record<string, unknown>>('/industries'),
      () => localProvider.getIndustries(),
    ) as Promise<Industry[]>,

  getIndustryBySlug: (slug) =>
    withFallback(
      'getIndustryBySlug',
      () => single<Industry & Record<string, unknown>>('/industries', slug),
      () => localProvider.getIndustryBySlug(slug),
    ) as Promise<Industry | null>,

  getProducts: () =>
    withFallback(
      'getProducts',
      () => collection<Product & Record<string, unknown>>('/products'),
      () => localProvider.getProducts(),
    ) as Promise<Product[]>,

  getProductBySlug: (slug) =>
    withFallback(
      'getProductBySlug',
      () => single<Product & Record<string, unknown>>('/products', slug),
      () => localProvider.getProductBySlug(slug),
    ) as Promise<Product | null>,

  getCaseStudies: (options) =>
    withFallback(
      'getCaseStudies',
      async () => {
        const items = await collection<CaseStudy & Record<string, unknown>>('/case-studies');
        return options?.limit ? items.slice(0, options.limit) : items;
      },
      () => localProvider.getCaseStudies(options),
    ) as Promise<CaseStudy[]>,

  getCaseStudyBySlug: (slug) =>
    withFallback(
      'getCaseStudyBySlug',
      () => single<CaseStudy & Record<string, unknown>>('/case-studies', slug),
      () => localProvider.getCaseStudyBySlug(slug),
    ) as Promise<CaseStudy | null>,

  getInsights: (options) =>
    withFallback(
      'getInsights',
      async () => {
        const params: Record<string, string> = { sort: 'publishedAt:desc' };
        if (options?.categorySlug) params['filters[category][slug][$eq]'] = options.categorySlug;
        if (options?.tag) params['filters[tags][$contains]'] = options.tag;
        if (options?.featured) params['filters[featured][$eq]'] = 'true';

        const items = await collection<Insight & Record<string, unknown>>('/insights', params);
        return options?.limit ? items.slice(0, options.limit) : items;
      },
      () => localProvider.getInsights(options),
    ) as Promise<Insight[]>,

  getInsightBySlug: (slug) =>
    withFallback(
      'getInsightBySlug',
      () => single<Insight & Record<string, unknown>>('/insights', slug),
      () => localProvider.getInsightBySlug(slug),
    ) as Promise<Insight | null>,

  getInsightCategories: () =>
    withFallback(
      'getInsightCategories',
      () => collection<InsightCategory & Record<string, unknown>>('/insight-categories'),
      () => localProvider.getInsightCategories(),
    ) as Promise<InsightCategory[]>,

  getAuthors: () =>
    withFallback(
      'getAuthors',
      () => collection<Author & Record<string, unknown>>('/authors'),
      () => localProvider.getAuthors(),
    ) as Promise<Author[]>,

  getAuthorBySlug: (slug) =>
    withFallback(
      'getAuthorBySlug',
      () => single<Author & Record<string, unknown>>('/authors', slug),
      () => localProvider.getAuthorBySlug(slug),
    ) as Promise<Author | null>,
};

export type { ServiceCategorySlug };
