/**
 * NEVIX API contract types.
 *
 * These mirror the Pydantic schemas in `apps/api/app/schemas`. Keeping them in a shared package
 * means a breaking backend change shows up as a TypeScript error in the web app rather than as a
 * runtime failure in a visitor's browser.
 *
 * Endpoints: specification §17.
 */

/** Service interest values accepted by the contact endpoint. */
export const SERVICE_INTERESTS = [
  'AI & Intelligence',
  'Automation',
  'Digital Engineering',
  'Data & Analytics',
  'Product & SaaS Engineering',
  'Consulting & Technology Advisory',
  'Not sure yet',
] as const;

export type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

export const INDUSTRY_OPTIONS = [
  'Government & Public Sector',
  'Healthcare',
  'Manufacturing',
  'Finance',
  'Education',
  'Enterprise / IT',
  'Other',
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

export const TIMELINE_OPTIONS = [
  'Immediate',
  'Within 1 month',
  '1-3 months',
  '3-6 months',
  '6+ months',
  'Exploring options',
] as const;

export type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

export const BUDGET_OPTIONS = [
  'Not disclosed',
  'Under $10k',
  '$10k - $50k',
  '$50k - $150k',
  '$150k+',
] as const;

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];

/** `POST /api/v1/contact` request body. */
export interface ContactRequest {
  name: string;
  email: string;
  organization?: string;
  service_interest: ServiceInterest;
  industry?: IndustryOption;
  requirement: string;
  timeline?: TimelineOption;
  budget?: BudgetOption;
  attachment_url?: string;
  consent: boolean;
  /** Which page the enquiry came from, for attribution. */
  source?: string;
  /** Honeypot. Must be empty; a value means a bot filled the hidden field. */
  website?: string;
}

export interface ContactResponse {
  id: string;
  reference: string;
  message: string;
  /** True when a notification email was actually dispatched. */
  notification_sent: boolean;
}

export interface NewsletterRequest {
  email: string;
  consent: boolean;
  source?: string;
  website?: string;
}

export interface NewsletterResponse {
  message: string;
  status: 'pending_confirmation' | 'already_subscribed';
}

/** Consistent error envelope returned by every FastAPI endpoint (specification §14). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Field-level validation errors, keyed by field name. */
    details?: Record<string, string[]>;
    request_id?: string;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  checks: Record<string, { status: 'ok' | 'error'; detail?: string }>;
}

export interface SiteConfigResponse {
  company_name: string;
  tagline: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  social: { label: string; href: string }[];
  /** Feature flags the frontend may act on without a redeploy. */
  features: {
    newsletter_enabled: boolean;
    attachments_enabled: boolean;
    search_enabled: boolean;
  };
}

export type LeadStatus = 'new' | 'reviewing' | 'qualified' | 'contacted' | 'closed' | 'spam';

export interface Lead {
  id: string;
  reference: string;
  name: string;
  email: string;
  organization: string | null;
  service_interest: string;
  industry: string | null;
  requirement: string;
  timeline: string | null;
  budget: string | null;
  attachment_url: string | null;
  status: LeadStatus;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
