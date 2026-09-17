/**
 * VASTRIX content domain types.
 *
 * These mirror the CMS content model in specification §7.1, §15 and §16. They are the contract
 * between `apps/web/lib/cms` and everything that renders content, so a provider swap (local
 * content -> Strapi) cannot change what components receive. See ADR-006.
 */

export interface SeoMetadata {
  /** Overrides the page `<title>`. Falls back to the entity name. */
  title?: string;
  /** Meta description. Should be 120-160 characters. */
  description?: string;
  /** Path to an OpenGraph image, relative to the site root. */
  ogImage?: string;
  /** Set when a page should not be indexed (drafts, demo-only routes). */
  noIndex?: boolean;
  keywords?: string[];
}

export interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** A short, scannable value statement used across cards and list sections. */
export interface ListItem {
  title: string;
  description?: string;
}

/* -------------------------------------------------------------------------------------------- */
/* Services                                                                                      */
/* -------------------------------------------------------------------------------------------- */

/** The six service categories are fixed by specification §5.1. */
export type ServiceCategorySlug =
  | 'ai-intelligence'
  | 'automation'
  | 'digital-engineering'
  | 'data-analytics'
  | 'product-saas-engineering'
  | 'consulting';

/** The four core pillars from catalogue §1. Product/SaaS and Consulting extend them. */
export type PillarSlug = Extract<
  ServiceCategorySlug,
  'ai-intelligence' | 'automation' | 'digital-engineering' | 'data-analytics'
>;

export interface ServiceCategory {
  slug: ServiceCategorySlug;
  name: string;
  /** Short label used in navigation where the full name is too long. */
  navLabel: string;
  /** Verbatim positioning line from the catalogue. */
  positioning: string;
  /** One-line value statement used on homepage cards (catalogue §13). */
  oneLineValue: string;
  /** Card CTA label from catalogue §13, e.g. "Explore AI". */
  cardCta: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  /** Icon key resolved by the frontend icon registry. */
  icon: string;
  /** True for the four core pillars. */
  isCorePillar: boolean;
  order: number;
  seo: SeoMetadata;
}

export interface Service {
  slug: string;
  name: string;
  categorySlug: ServiceCategorySlug;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  /** "Problem we solve" — catalogue §12. */
  problemStatement: string;
  /** "What we do" narrative. */
  whatWeDo: string;
  /** Catalogue "Typical deliverables". */
  capabilities: string[];
  /** Catalogue "Typical use cases". */
  useCases: string[];
  technologyApproach?: string;
  /** Tools and platforms actually used — never padded (catalogue §16). */
  technologies?: string[];
  outcomes?: string[];
  faq?: FaqItem[];
  /** Slugs of related case studies. */
  caseStudySlugs?: string[];
  /** Slugs of related solutions. */
  solutionSlugs?: string[];
  order: number;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Solutions                                                                                     */
/* -------------------------------------------------------------------------------------------- */

export interface SolutionStep {
  title: string;
  description: string;
}

export interface Solution {
  slug: string;
  name: string;
  /** The business problem, stated plainly. */
  problem: string;
  summary: string;
  heroTitle: string;
  heroDescription: string;
  /** The end-to-end workflow this solution implements. */
  workflow: SolutionStep[];
  technicalApproach: string[];
  /**
   * Illustrative outcomes. Rendered under a visible "illustrative, not a guarantee" note —
   * specification §31 forbids guaranteed ROI or performance claims.
   */
  illustrativeOutcomes: string[];
  /** Service slugs that deliver this solution. */
  relatedServiceSlugs: string[];
  relatedIndustrySlugs?: string[];
  icon: string;
  order: number;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Industries                                                                                    */
/* -------------------------------------------------------------------------------------------- */

export interface Industry {
  slug: string;
  name: string;
  summary: string;
  heroTitle: string;
  heroDescription: string;
  /** The operational context VASTRIX works in — not a claim of sector credentials. */
  context: string;
  capabilityAreas: ListItem[];
  /** Constraints typical of the sector that shape the engineering approach. */
  considerations: string[];
  relatedServiceSlugs: string[];
  relatedSolutionSlugs: string[];
  icon: string;
  order: number;
  /**
   * Set for sectors where regulatory or procurement claims are sensitive (e.g. government).
   * Renders an explicit "no approvals or empanelments are claimed" notice.
   */
  requiresComplianceNotice?: boolean;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Products                                                                                      */
/* -------------------------------------------------------------------------------------------- */

/** Product lifecycle from specification §9.1. */
export type ProductStatus = 'concept' | 'prototype' | 'beta' | 'live' | 'coming-soon';

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  status: ProductStatus;
  summary: string;
  heroTitle: string;
  heroDescription: string;
  problem: string;
  plannedCapabilities: string[];
  /** Which pillars the product draws on. */
  relatedServiceSlugs: string[];
  icon: string;
  /** True while the entry is a registered placeholder (DD-002). */
  isPlaceholder: boolean;
  order: number;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Case studies                                                                                  */
/* -------------------------------------------------------------------------------------------- */

/**
 * `demo` content is fabricated for demonstration and is labelled as such in the UI.
 * `approved` content has been permission-cleared and evidence-checked.
 */
export type CaseStudyKind = 'demo' | 'approved';

export interface CaseStudyOutcome {
  label: string;
  value: string;
  /** How the number was established. Required for `approved` studies. */
  evidence?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  kind: CaseStudyKind;
  /** Omitted unless permission has been granted (catalogue §16). */
  client?: string;
  industrySlug: string;
  summary: string;
  problem: string;
  constraints: string[];
  approach: string;
  architecture: string[];
  implementation: string[];
  outcomes: CaseStudyOutcome[];
  lessonsLearned?: string[];
  technologies: string[];
  relatedServiceSlugs: string[];
  publishedAt: string;
  order: number;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Insights                                                                                      */
/* -------------------------------------------------------------------------------------------- */

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar?: ImageRef;
}

export type InsightCategorySlug =
  'ai' | 'automation' | 'data' | 'engineering' | 'cloud' | 'technology' | 'digital-transformation';

export interface InsightCategory {
  slug: InsightCategorySlug;
  name: string;
  description: string;
}

export interface Insight {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-subset body rendered by the frontend content renderer. */
  content: string;
  authorSlug: string;
  categorySlug: InsightCategorySlug;
  tags: string[];
  featuredImage?: ImageRef;
  publishedAt: string;
  updatedAt?: string;
  /** Estimated reading time in minutes, computed at build time when absent. */
  readingMinutes?: number;
  featured?: boolean;
  seo: SeoMetadata;
}

/* -------------------------------------------------------------------------------------------- */
/* Site settings                                                                                 */
/* -------------------------------------------------------------------------------------------- */

export interface SiteSettings {
  companyName: string;
  tagline: string;
  positioning: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  social: { label: string; href: string }[];
}

/* -------------------------------------------------------------------------------------------- */
/* Search                                                                                        */
/* -------------------------------------------------------------------------------------------- */

export type SearchEntityType =
  'service' | 'service-category' | 'solution' | 'industry' | 'product' | 'case-study' | 'insight';

export interface SearchResult {
  type: SearchEntityType;
  title: string;
  excerpt: string;
  href: string;
  /** Relevance score, higher is better. */
  score: number;
}
