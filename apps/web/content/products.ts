import type { Product } from '@nevix/types';

/**
 * Products — specification §9.1, instruction §22.
 *
 * DUMMY-DATA: DD-002
 * No NEVIX product data was supplied with the source material. Instruction §22 is explicit:
 * "Do not invent actual NEVIX products unless project data explicitly contains them. Where
 * actual product information is unavailable: use clearly marked demo content or 'Coming Soon'."
 *
 * Every entry below is therefore at `concept` status, flagged `isPlaceholder`, and rendered with
 * a visible "Concept — not yet available" badge. The directions described are drawn from the
 * catalogue's documented capabilities so they are plausible extensions rather than invented
 * products, and no availability date, pricing, customer or capability claim is made.
 *
 * Replace with real product data, or keep at "Coming Soon" — which catalogue §16 explicitly
 * permits — before launch.
 */
export const products: Product[] = [
  {
    slug: 'document-intelligence-platform',
    name: 'Document Intelligence Platform',
    tagline: 'Concept — document processing as a reusable product',
    status: 'concept',
    summary:
      'A concept for packaging NEVIX document intelligence work into a configurable product rather than a per-client build.',
    heroTitle: 'Document Intelligence Platform',
    heroDescription:
      'A product direction under consideration: the document classification, extraction, validation and review workflow NEVIX builds for clients, packaged as a configurable platform.',
    problem:
      'Document processing engagements repeat the same architecture — ingest, classify, extract, validate, review, deliver — while differing mainly in document types and business rules. A configurable product would make that repeatable work faster to deploy and cheaper to operate.',
    plannedCapabilities: [
      'Configurable document types and extraction templates',
      'Business-rule validation without custom code',
      'Confidence-threshold routing to human review',
      'A reviewer interface for correcting low-confidence extractions',
      'Self-hosted deployment so documents stay on your infrastructure',
    ],
    relatedServiceSlugs: ['document-intelligence', 'intelligent-automation'],
    icon: 'file-text',
    isPlaceholder: true,
    order: 1,
    seo: {
      description:
        'A NEVIX product concept: document classification, extraction, validation and review packaged as a configurable, self-hostable platform. Not yet available.',
      noIndex: true,
    },
  },
  {
    slug: 'workflow-automation-suite',
    name: 'Workflow Automation Suite',
    tagline: 'Concept — workflow modelling without the bespoke build',
    status: 'concept',
    summary:
      'A concept for a configurable workflow engine covering the state machines, approvals and escalations NEVIX builds repeatedly.',
    heroTitle: 'Workflow Automation Suite',
    heroDescription:
      'A product direction under consideration: the state machines, role-based approvals, notifications and escalation logic behind NEVIX workflow engagements, made configurable rather than bespoke.',
    problem:
      'Workflow automation engagements consistently need the same core: explicit states, role-based transitions, timeouts, escalation and an audit trail. Rebuilding that per engagement spends effort on the part that does not vary.',
    plannedCapabilities: [
      'Visual workflow state and transition modelling',
      'Role-based permissions on each transition',
      'Timeout and escalation rules per state',
      'Notification routing',
      'Full audit trail with actor, timestamp and reason',
    ],
    relatedServiceSlugs: ['workflow-automation', 'business-process-automation'],
    icon: 'workflow',
    isPlaceholder: true,
    order: 2,
    seo: {
      description:
        'A NEVIX product concept: a configurable workflow engine with states, role-based approvals, escalation and audit trail. Not yet available.',
      noIndex: true,
    },
  },
  {
    slug: 'knowledge-assistant',
    name: 'Knowledge Assistant',
    tagline: 'Concept — grounded internal knowledge access',
    status: 'concept',
    summary:
      'A concept for packaging the retrieval-grounded assistant pattern, with access control applied at retrieval time.',
    heroTitle: 'Knowledge Assistant',
    heroDescription:
      'A product direction under consideration: a self-hostable assistant that answers from your approved content with citations, enforces access control at retrieval, and declines rather than inventing an answer.',
    problem:
      'Organisations want internal knowledge access but cannot accept an assistant that invents answers or surfaces content a user should not see. The hard parts — grounding, citation and retrieval-time access control — are the same each time.',
    plannedCapabilities: [
      'Retrieval grounded strictly in approved content',
      'Access control applied at retrieval, not after generation',
      'Citations linking every answer to its source passage',
      'An explicit decline path when retrieval confidence is insufficient',
      'Self-hosted models so content never leaves your infrastructure',
    ],
    relatedServiceSlugs: ['generative-ai-solutions', 'nlp'],
    icon: 'book-open',
    isPlaceholder: true,
    order: 3,
    seo: {
      description:
        'A NEVIX product concept: a self-hostable, retrieval-grounded knowledge assistant with citations and retrieval-time access control. Not yet available.',
      noIndex: true,
    },
  },
];

export const productBySlug = new Map(products.map((p) => [p.slug, p]));

/** Human-readable labels and styling intent for each lifecycle status (specification §9.1). */
export const productStatusMeta: Record<
  Product['status'],
  { label: string; description: string; tone: 'neutral' | 'info' | 'warning' | 'success' }
> = {
  concept: {
    label: 'Concept',
    description: 'A direction under consideration. Not built and not available.',
    tone: 'neutral',
  },
  prototype: {
    label: 'Prototype',
    description: 'An early build used to validate an approach. Not available for production use.',
    tone: 'warning',
  },
  beta: {
    label: 'Beta',
    description: 'In limited use and actively changing.',
    tone: 'info',
  },
  live: {
    label: 'Live',
    description: 'Generally available and supported.',
    tone: 'success',
  },
  'coming-soon': {
    label: 'Coming Soon',
    description: 'Planned. Details to be announced.',
    tone: 'neutral',
  },
};
