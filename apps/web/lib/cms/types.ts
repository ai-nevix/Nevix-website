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

/**
 * The content provider contract.
 *
 * Every component reads content through this interface, so swapping the local provider for
 * Strapi changes one line of configuration and nothing else. See ADR-006.
 */
export interface ContentProvider {
  readonly name: 'local' | 'strapi';

  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null>;

  getServices(options?: { categorySlug?: ServiceCategorySlug }): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | null>;

  getSolutions(): Promise<Solution[]>;
  getSolutionBySlug(slug: string): Promise<Solution | null>;

  getIndustries(): Promise<Industry[]>;
  getIndustryBySlug(slug: string): Promise<Industry | null>;

  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;

  getCaseStudies(options?: { limit?: number }): Promise<CaseStudy[]>;
  getCaseStudyBySlug(slug: string): Promise<CaseStudy | null>;

  getInsights(options?: {
    limit?: number;
    categorySlug?: string;
    tag?: string;
    featured?: boolean;
  }): Promise<Insight[]>;
  getInsightBySlug(slug: string): Promise<Insight | null>;
  getInsightCategories(): Promise<InsightCategory[]>;
  getAuthors(): Promise<Author[]>;
  getAuthorBySlug(slug: string): Promise<Author | null>;
}

/**
 * Raised when a remote provider cannot be reached or returns an unusable response.
 * Callers catch this to render a "content temporarily unavailable" state rather than a stack
 * trace (specification §13.1, instruction §52).
 */
export class ContentUnavailableError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ContentUnavailableError';
  }
}
