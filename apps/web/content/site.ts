/**
 * Site-wide configuration and navigation.
 *
 * Copy here is taken from the supplied catalogue and specification. Anything not present in those
 * documents is either omitted or registered as dummy data — see docs/dummy-data/registry.md.
 */

export const siteConfig = {
  name: 'VASTRIX',
  /** Catalogue §17. */
  tagline: 'Explore. Automate. Evolve.',
  /** Specification §4 / brand board. */
  positioning: 'Intelligent Technology for a Smarter Tomorrow.',
  /** Catalogue §1 / §17. */
  pillarLine: 'AI • Automation • Digital Engineering • Data & Analytics',

  /** Catalogue §14 — the website-ready master description, used verbatim for meta descriptions. */
  masterDescription:
    'VASTRIX builds intelligent technology solutions across AI, automation, digital engineering and data. We help organizations simplify complex processes, connect systems, turn data into insight and build scalable digital products.',

  masterDescriptionExtended:
    'From AI-powered applications and intelligent automation to custom software, modern web platforms and data-driven decision systems, VASTRIX works across the technology lifecycle. We combine problem discovery, engineering and automation to create practical solutions that improve efficiency, enable better decisions and support long-term digital evolution.',

  /**
   * DUMMY-DATA: DD-004
   * Official contact details were not supplied. `vastrix.ai@gmail.com` is a conventional placeholder
   * and no phone number or street address is published rather than inventing one.
   * Replace with verified details before launch.
   */
  contact: {
    email: 'vastrix.ai@gmail.com',
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
   * Social handles follow the brand name but have not been confirmed as registered profiles.
   * Confirm each URL or remove the entry — a dead link inside Organization schema is worse
   * than no link at all.
   */
  social: [
    { label: 'LinkedIn', href: 'www.linkedin.com/in/vastrix-ai-3a88ba437' },
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
  talk: { label: 'Talk to VASTRIX', href: '/contact' },
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
    panelDescription: 'How VASTRIX capabilities combine to solve a specific business problem.',
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
    panelDescription: 'Sector context, without claiming credentials VASTRIX does not hold.',
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
      { label: 'About VASTRIX', href: '/about' },
      { label: 'Team', href: '/team' },
      { label: 'How We Work', href: '/about#how-we-work' },
      { label: 'Engineering Principles', href: '/about#principles' },
      { label: 'Engagement Models', href: '/about#engagement' },
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

/** Brand assets. The supplied logo is authoritative — do not substitute or redraw (instruction §9). */
export const brandAssets = {
  /** Full lockup on a light background. */
  logoLight: '/brand/vastrix-logo.png',
  /** Circular dark mark, used for the favicon, app icon and social avatar. */
  markDark: '/brand/vastrix-mark.png',
  /** Brand board banner, used sparingly as an About-page visual. */
  brandBoard: '/brand/vastrix-brand-board.jpg',
  /** Hero-scale brand visual from the supplied wallpaper. */
  wallpaper: '/brand/vastrix-wallpaper.jpg',
  /** The isolated mark, used by the brand intro animation. */
  symbol: '/brand/vastrix-symbol.png',
  /**
   * The wordmark alone, cropped losslessly from the lower band of the supplied lockups. The
   * artwork is the supplied one, trimmed — not redrawn.
   *
   * `wordmarkDark` is the navy wordmark from `vastrix-logo.png`, for light backgrounds;
   * `wordmarkLight` is the white one from `vastrix-logo-dark.png`, for dark backgrounds.
   */
  wordmarkDark: '/brand/vastrix-wordmark-dark.png',
  wordmarkLight: '/brand/vastrix-wordmark-light.png',
} as const;
