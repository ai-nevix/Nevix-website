import 'server-only';

import { getServerEnv } from '@/lib/env';

import { localProvider } from './local-provider';
import { strapiProvider } from './strapi-provider';
import type { ContentProvider } from './types';

/**
 * The CMS access layer (specification §30, instruction §30).
 *
 * Every component reads content through the functions exported here. CMS requests are never made
 * directly from a component, which is what makes the provider swap in ADR-006 a configuration
 * change rather than a refactor.
 *
 * `server-only` is imported at the top so that importing this module from a client component is a
 * build error — the Strapi token must never be bundled for the browser.
 */
function getProvider(): ContentProvider {
  return getServerEnv().CONTENT_PROVIDER === 'strapi' ? strapiProvider : localProvider;
}

export const getServiceCategories: ContentProvider['getServiceCategories'] = () =>
  getProvider().getServiceCategories();

export const getServiceCategoryBySlug: ContentProvider['getServiceCategoryBySlug'] = (slug) =>
  getProvider().getServiceCategoryBySlug(slug);

export const getServices: ContentProvider['getServices'] = (options) =>
  getProvider().getServices(options);

export const getServiceBySlug: ContentProvider['getServiceBySlug'] = (slug) =>
  getProvider().getServiceBySlug(slug);

export const getSolutions: ContentProvider['getSolutions'] = () => getProvider().getSolutions();

export const getSolutionBySlug: ContentProvider['getSolutionBySlug'] = (slug) =>
  getProvider().getSolutionBySlug(slug);

export const getIndustries: ContentProvider['getIndustries'] = () => getProvider().getIndustries();

export const getIndustryBySlug: ContentProvider['getIndustryBySlug'] = (slug) =>
  getProvider().getIndustryBySlug(slug);

export const getProducts: ContentProvider['getProducts'] = () => getProvider().getProducts();

export const getProductBySlug: ContentProvider['getProductBySlug'] = (slug) =>
  getProvider().getProductBySlug(slug);

export const getCaseStudies: ContentProvider['getCaseStudies'] = (options) =>
  getProvider().getCaseStudies(options);

export const getCaseStudyBySlug: ContentProvider['getCaseStudyBySlug'] = (slug) =>
  getProvider().getCaseStudyBySlug(slug);

export const getInsights: ContentProvider['getInsights'] = (options) =>
  getProvider().getInsights(options);

export const getInsightBySlug: ContentProvider['getInsightBySlug'] = (slug) =>
  getProvider().getInsightBySlug(slug);

export const getInsightCategories: ContentProvider['getInsightCategories'] = () =>
  getProvider().getInsightCategories();

export const getAuthors: ContentProvider['getAuthors'] = () => getProvider().getAuthors();

export const getAuthorBySlug: ContentProvider['getAuthorBySlug'] = (slug) =>
  getProvider().getAuthorBySlug(slug);

/** Which provider is serving content. Surfaced on the health route for operational visibility. */
export function getActiveProviderName(): ContentProvider['name'] {
  return getProvider().name;
}

export { ContentUnavailableError } from './types';
export type { ContentProvider } from './types';
