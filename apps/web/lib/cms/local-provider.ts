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
} from '@vastrix/types';

import { caseStudies } from '@/content/case-studies';
import { industries } from '@/content/industries';
import { authors, insightCategories, insights } from '@/content/insights';
import { products } from '@/content/products';
import { serviceCategories } from '@/content/service-categories';
import { getServicesByCategory, services } from '@/content/services';
import { solutions } from '@/content/solutions';

import type { ContentProvider } from './types';

/**
 * Content served from the typed files in `content/`.
 *
 * This is the default provider. It keeps the site buildable, testable and deployable without a
 * running CMS, and it is what the Strapi seed script uses as its source. See ADR-006.
 *
 * The methods are async because the interface is shared with a network-backed provider; the
 * `Promise.resolve` wrappers are intentional, not oversight.
 */
export const localProvider: ContentProvider = {
  name: 'local',

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return [...serviceCategories].sort((a, b) => a.order - b.order);
  },

  async getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    return serviceCategories.find((c) => c.slug === slug) ?? null;
  },

  async getServices(options?: { categorySlug?: ServiceCategorySlug }): Promise<Service[]> {
    if (options?.categorySlug) {
      return getServicesByCategory(options.categorySlug);
    }
    return [...services];
  },

  async getServiceBySlug(slug: string): Promise<Service | null> {
    return services.find((s) => s.slug === slug) ?? null;
  },

  async getSolutions(): Promise<Solution[]> {
    return [...solutions].sort((a, b) => a.order - b.order);
  },

  async getSolutionBySlug(slug: string): Promise<Solution | null> {
    return solutions.find((s) => s.slug === slug) ?? null;
  },

  async getIndustries(): Promise<Industry[]> {
    return [...industries].sort((a, b) => a.order - b.order);
  },

  async getIndustryBySlug(slug: string): Promise<Industry | null> {
    return industries.find((i) => i.slug === slug) ?? null;
  },

  async getProducts(): Promise<Product[]> {
    return [...products].sort((a, b) => a.order - b.order);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getCaseStudies(options?: { limit?: number }): Promise<CaseStudy[]> {
    const sorted = [...caseStudies].sort((a, b) => a.order - b.order);
    return options?.limit ? sorted.slice(0, options.limit) : sorted;
  },

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
    return caseStudies.find((c) => c.slug === slug) ?? null;
  },

  async getInsights(options?: {
    limit?: number;
    categorySlug?: string;
    tag?: string;
    featured?: boolean;
  }): Promise<Insight[]> {
    let result = [...insights];

    if (options?.categorySlug) {
      result = result.filter((i) => i.categorySlug === options.categorySlug);
    }
    if (options?.tag) {
      result = result.filter((i) => i.tags.includes(options.tag as string));
    }
    if (options?.featured) {
      result = result.filter((i) => i.featured === true);
    }

    result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return options?.limit ? result.slice(0, options.limit) : result;
  },

  async getInsightBySlug(slug: string): Promise<Insight | null> {
    return insights.find((i) => i.slug === slug) ?? null;
  },

  async getInsightCategories(): Promise<InsightCategory[]> {
    return [...insightCategories];
  },

  async getAuthors(): Promise<Author[]> {
    return [...authors];
  },

  async getAuthorBySlug(slug: string): Promise<Author | null> {
    return authors.find((a) => a.slug === slug) ?? null;
  },
};
