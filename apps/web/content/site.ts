import { BRAND_PAGE_ENABLED } from './brand';

/**
 * Site-wide configuration and navigation.
 *
 * Copy here is taken from the supplied catalogue and specification. Anything not present in those
 * documents is either omitted or registered as dummy data — see docs/dummy-data/registry.md.
 */

export const siteConfig = {
  name: 'NEVIX',
  /** Catalogue §17 — set beneath the wordmark in every NEVIX lockup. */
  tagline: 'Explore. Automate. Evolve.',
  /** The NEVIX brand line, from the supplied brand photography. Leads the homepage. */
  headline: 'Intelligence in Motion.',
  /** Specification §4 / brand board. */
  positioning: 'Intelligent Technology for a Smarter Tomorrow.',
  /** Catalogue §1 / §17. */
  pillarLine: 'AI • Automation • Digital Engineering • Data & Analytics',

  /** Catalogue §14 — the website-ready master description, used verbatim for meta descriptions. */
  masterDescription:
    'NEVIX builds intelligent technology solutions across AI, automation, digital engineering and data. We help organizations simplify complex processes, connect systems, turn data into insight and build scalable digital products.',

  masterDescriptionExtended:
    'From AI-powered applications and intelligent automation to custom software, modern web platforms and data-driven decision systems, NEVIX works across the technology lifecycle. We combine problem discovery, engineering and automation to create practical solutions that improve efficiency, enable better decisions and support long-term digital evolution.',

  /**
   * DUMMY-DATA: DD-004
   * `nevix.ai@gmail.com` was confirmed as the contact address at the rebrand. No phone number or
   * street address has been supplied, so none is published rather than inventing one.
   */
  contact: {
    email: 'nevix.ai@gmail.com',
    /** Intentionally null until a verified number is supplied. */
    phone: null as string | null,
    /** Intentionally null until a registered address is supplied. */
    address: null as string | null,
  },

  /**
   * DUMMY-DATA: DD-005
   * Registered entity name, jurisdiction and registration identifiers were not supplied.
   * The footer renders this string instead of inventing a legal entity.
   */
  legalEntity: 'Registered entity details to be confirmed.',

  /**
   * DUMMY-DATA: DD-010
   * These are the profiles registered under the company's former name. They are kept deliberately
   * until NEVIX profiles exist — replace each URL as its NEVIX profile is created. A dead link
   * inside Organization schema is worse than no link at all.
   */
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vastrix-ai-3a88ba437' },
    { label: 'GitHub', href: 'https://github.com/vastrix' },
    { label: 'X', href: 'https://x.com/vastrix' },
  ],
} as const;

/**
 * Canonical site origin. Falls back to localhost so `next build` never emits a broken
 * canonical URL during local development or CI.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

/** Calls to action recommended by catalogue §15. Labels describe the action (specification §10.1). */
export const ctas = {
  primary: { label: 'Discuss a Project', href: '/contact' },
  services: { label: 'Explore Our Services', href: '/services' },
  automate: { label: 'Automate a Process', href: '/contact?interest=automation' },
  aiUseCase: { label: 'Explore an AI Use Case', href: '/contact?interest=ai-intelligence' },
  buildProduct: {
    label: 'Build a Digital Product',
    href: '/contact?interest=product-saas-engineering',
  },
  talk: { label: 'Talk to NEVIX', href: '/contact' },
  consultation: { label: 'Request a Consultation', href: '/contact?interest=consulting' },
} as const;

export interface NavChild {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** Rendered as a mega-menu panel on desktop and a disclosure on mobile. */
  children?: NavChild[];
  /** Short blurb shown at the head of the mega-menu panel. */
  panelHeading?: string;
  panelDescription?: string;
}

/** Primary navigation — catalogue §1 "Recommended website navigation" / specification §5. */
export const primaryNav: NavItem[] = [
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    href: '/services',
    panelHeading: 'What we build',
    panelDescription: 'Four core pillars, extended by product engineering and technology advisory.',
    children: [
      {
        label: 'AI & Intelligence',
        href: '/services/ai-intelligence',
        description: 'Systems that understand, predict, generate, classify and assist.',
        icon: 'brain',
      },
      {
        label: 'Automation',
        href: '/services/automation',
        description: 'Reliable automated workflows for repetitive and multi-step work.',
        icon: 'settings',
      },
      {
        label: 'Digital Engineering',
        href: '/services/digital-engineering',
        description: 'Websites, applications, APIs, software systems and experiences.',
        icon: 'code',
      },
      {
        label: 'Data & Analytics',
        href: '/services/data-analytics',
        description: 'Reporting, insight, prediction and decision support.',
        icon: 'chart',
      },
      {
        label: 'Product & SaaS Engineering',
        href: '/services/product-saas-engineering',
        description: 'SaaS products, MVPs, AI products and internal tools.',
        icon: 'package',
      },
      {
        label: 'Consulting & Technology Advisory',
        href: '/services/consulting',
        description: 'Transformation, automation and AI readiness assessments.',
        icon: 'compass',
      },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions',
    panelHeading: 'Outcome-oriented solution patterns',
    panelDescription: 'How NEVIX capabilities combine to solve a specific business problem.',
    children: [
      {
        label: 'AI-Powered Document Processing',
        href: '/solutions/ai-document-processing',
        description: 'Classify, extract and validate document data automatically.',
        icon: 'file-text',
      },
      {
        label: 'Intelligent Ticket Triage',
        href: '/solutions/intelligent-ticket-triage',
        description: 'Classify, prioritise and route requests on arrival.',
        icon: 'inbox',
      },
      {
        label: 'Business Workflow Automation',
        href: '/solutions/business-workflow-automation',
        description: 'One workflow, one status, one audit trail.',
        icon: 'workflow',
      },
      {
        label: 'AI Knowledge Assistant',
        href: '/solutions/ai-knowledge-assistant',
        description: 'Answers grounded in your own content, with citations.',
        icon: 'book-open',
      },
      {
        label: 'Operational Dashboards',
        href: '/solutions/operational-dashboards',
        description: 'One agreed set of numbers, refreshed automatically.',
        icon: 'gauge',
      },
      {
        label: 'Custom Digital Portals',
        href: '/solutions/custom-digital-portals',
        description: 'Accessible submission and self-service tracking.',
        icon: 'layout-panel-left',
      },
    ],
  },
  {
    label: 'Industries',
    href: '/industries',
    panelHeading: 'Where we work',
    panelDescription: 'Sector context, without claiming credentials NEVIX does not hold.',
    children: [
      {
        label: 'Government & Public Sector',
        href: '/industries/government-public-sector',
        description: 'Citizen services, departmental workflow and analytics.',
        icon: 'landmark',
      },
      {
        label: 'Healthcare',
        href: '/industries/healthcare',
        description: 'Administrative automation and document processing.',
        icon: 'heart-pulse',
      },
      {
        label: 'Manufacturing',
        href: '/industries/manufacturing',
        description: 'Production reporting, quality data and automation.',
        icon: 'factory',
      },
      {
        label: 'Finance',
        href: '/industries/finance',
        description: 'Document processing and explainable decision support.',
        icon: 'banknote',
      },
      {
        label: 'Education',
        href: '/industries/education',
        description: 'Student portals and administrative workflow.',
        icon: 'graduation-cap',
      },
      {
        label: 'Enterprise & IT',
        href: '/industries/enterprise-it',
        description: 'Service-desk automation, tooling and integrations.',
        icon: 'network',
      },
    ],
  },
  { label: 'Products', href: '/products' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Insights', href: '/insights' },
];

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const footerNav: FooterColumn[] = [
  {
    title: 'Services',
    links: [
      { label: 'AI & Intelligence', href: '/services/ai-intelligence' },
      { label: 'Automation', href: '/services/automation' },
      { label: 'Digital Engineering', href: '/services/digital-engineering' },
      { label: 'Data & Analytics', href: '/services/data-analytics' },
      { label: 'Product & SaaS Engineering', href: '/services/product-saas-engineering' },
      { label: 'Consulting & Advisory', href: '/services/consulting' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Industries', href: '/industries' },
      { label: 'Products', href: '/products' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Insights', href: '/insights' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About NEVIX', href: '/about' },
      { label: 'Team', href: '/team' },
      { label: 'How We Work', href: '/about#how-we-work' },
      { label: 'Engineering Principles', href: '/about#principles' },
      { label: 'Engagement Models', href: '/about#engagement' },
      // The Brand page is hidden for now — see BRAND_PAGE_ENABLED in content/brand.ts.
      ...(BRAND_PAGE_ENABLED ? [{ label: 'Brand', href: '/brand' }] : []),
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Use', href: '/legal/terms' },
      { label: 'Cookie Notice', href: '/legal/cookies' },
    ],
  },
];

/**
 * Brand assets, all derived from the supplied originals in `brand-assets/nevix/` by
 * `scripts/derive-brand-assets.mjs`. The supplied artwork is authoritative — it is separated from
 * its background and cropped, never redrawn (instruction §9).
 */
export interface BrandImage {
  src: string;
  width: number;
  height: number;
}

export const brandAssets = {
  /** The N, on transparency. Works on both midnight and white. */
  mark: { src: '/brand/nevix-mark.png', width: 450, height: 551 },
  /** The silver monochrome N, on transparency — a quiet watermark on light sections. */
  markSilver: { src: '/brand/nevix-mark-silver.png', width: 420, height: 509 },
  /** Navy wordmark (from the primary lockup), for light backgrounds. */
  wordmarkDark: { src: '/brand/nevix-wordmark-dark.png', width: 1302, height: 268 },
  /** White wordmark (from the light-on-dark wordmark), for midnight backgrounds. */
  wordmarkLight: { src: '/brand/nevix-wordmark-light.png', width: 1457, height: 255 },
  /** Landscape region of the workspace photograph — the homepage hero. No logo or copy in it. */
  heroHorizon: { src: '/brand/nevix-hero-horizon.webp', width: 912, height: 776 },
  /** The illuminated wall sign. */
  wallSign: { src: '/brand/nevix-wall-sign.webp', width: 1928, height: 815 },
  /** The full logo summary board. */
  brandBoard: { src: '/brand/nevix-brand-board.webp', width: 1536, height: 1024 },
  /** Square app icon, for structured data and social profiles. */
  appIcon: { src: '/brand/icon-512.png', width: 512, height: 512 },
} as const satisfies Record<string, BrandImage>;
