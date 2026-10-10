import type { CaseStudy } from '@nevix/types';

/**
 * Case studies.
 *
 * DUMMY-DATA: DD-001
 * No client work was supplied with the source material, and catalogue §16 forbids publishing
 * client logos or case studies without permission.
 *
 * Every entry below has `kind: 'demo'`, which causes the UI to render a prominent
 * "Demo Case Study — illustrative example, not a NEVIX client engagement" banner on the card,
 * the detail page and in the page title. No client is named, no client logo is used, and the
 * outcomes are described qualitatively rather than as measured statistics, because specification
 * §31 requires evidence for case-study metrics and forbids guaranteed ROI claims.
 *
 * Replace with approved, permission-cleared engagements — or remove /case-studies from navigation
 * — before launch. See docs/dummy-data/replacement-checklist.md.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: 'invoice-to-workflow-automation',
    title: 'Invoice-to-Workflow Automation',
    kind: 'demo',
    industrySlug: 'finance',
    summary:
      'An illustrative walkthrough of how NEVIX approaches a high-volume invoice processing problem, from discovery through to a validated document-to-workflow pipeline.',
    problem:
      'A finance function receives several thousand supplier invoices a month across PDF, scanned paper and email body text. Each is read by a clerk, keyed into the finance system, matched to a purchase order and routed for approval. Errors surface at month-end reconciliation, by which point tracing them back to a source document is slow.',
    constraints: [
      'The finance system exposes an API for invoice creation but not for purchase-order matching',
      'Scanned invoices vary in quality; some are photographs taken on a phone',
      'Approval thresholds are policy and change periodically without engineering involvement',
      'Source documents must be retained and retrievable for audit',
      'No invoice may be posted without a human decision above a defined value',
    ],
    approach:
      'Discovery established that roughly the same fields were needed from every invoice, but that the confidence with which they could be extracted varied enormously between clean PDFs and phone photographs. The design therefore treats confidence as a first-class output: extraction produces a score per field, and the routing decision is made by deterministic rules rather than by the model. Approval thresholds are held as configuration so the finance team can change policy without a release.',
    architecture: [
      'Intake service accepting email, upload and API submission, storing originals in object storage',
      'Classification stage identifying document type before extraction',
      'Layered extraction: structured PDF parsing first, OCR fallback, language-model extraction for unstructured cases',
      'Validation service checking totals, supplier records, dates and mandatory fields against reference data',
      'Deterministic rules engine deciding auto-post, route-to-approval or route-to-review',
      'Workflow service handling approvals, escalation and posting to the finance system',
      'Append-only audit log linking every posted record to its source document',
    ],
    implementation: [
      'Built an evaluation set from a sample of real invoices across all input qualities before writing extraction code',
      'Implemented extraction as a pipeline with per-field confidence, measured against that evaluation set',
      'Moved approval thresholds into configuration owned by the finance team',
      'Routed low-confidence fields to a reviewer interface highlighting the specific uncertain values',
      'Instrumented extraction quality and review volume as separate metrics',
      'Retained source documents in object storage with access control and an audit link',
    ],
    outcomes: [
      {
        label: 'Manual keying',
        value: 'Limited to documents failing validation or confidence thresholds',
      },
      {
        label: 'Error detection',
        value: 'Moved from month-end reconciliation to point of entry',
      },
      {
        label: 'Auditability',
        value: 'Every posted record traceable to its source document',
      },
      {
        label: 'Policy changes',
        value: 'Approval thresholds changeable by finance without a release',
      },
    ],
    lessonsLearned: [
      'Building the evaluation set before the extraction code changed which approach was selected — the phone-photograph subset would have been missed entirely by a PDF-first design.',
      'Keeping the routing decision in rules rather than in the model was what made the system acceptable to audit.',
      'The reviewer interface mattered more than extraction accuracy. Reviewers work quickly when the uncertain field is highlighted and slowly when they must re-read the whole document.',
    ],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'MinIO', 'Celery', 'Redis', 'Docker'],
    relatedServiceSlugs: [
      'document-intelligence',
      'intelligent-automation',
      'business-process-automation',
    ],
    publishedAt: '2026-02-18',
    order: 1,
    seo: {
      description:
        'Demo case study: an illustrative walkthrough of NEVIX’s approach to high-volume invoice processing using document intelligence and workflow automation.',
      noIndex: true,
    },
  },
  {
    slug: 'intelligent-ticket-triage-demo',
    title: 'Intelligent Service-Desk Triage',
    kind: 'demo',
    industrySlug: 'enterprise-it',
    summary:
      'An illustrative walkthrough of classifying, prioritising and routing service-desk tickets automatically while keeping the routing decision auditable.',
    problem:
      'An internal service desk receives requests through email, a portal and chat. Triage is manual and performed by whoever is on the queue, so categorisation is inconsistent, urgent requests are sometimes missed among routine ones, and there is no record of why a ticket went where it did.',
    constraints: [
      'Service-level policy is owned by the service-desk manager and changes without engineering involvement',
      'Some request categories are sensitive and must never be routed automatically',
      'Requests arrive in more than one language',
      'Every routing decision must be explainable during service review',
    ],
    approach:
      'The design separates understanding from deciding. A classification stage converts unstructured request text into structured fields — category, extracted entities, urgency signals — each with a confidence score. A deterministic rules engine then combines those fields with the service-level policy to set priority and destination. The model never decides where a ticket goes, which is what makes the outcome explainable and the policy changeable.',
    architecture: [
      'Intake adapters normalising email, portal and chat requests into one queue',
      'Classification service producing category, entities and confidence scores',
      'Rules engine applying service-level policy to produce priority and destination',
      'Sensitive-category detection forcing human triage regardless of confidence',
      'Feedback capture recording reviewer corrections as labelled evaluation data',
      'Separate metrics for classification quality and ticket volume',
    ],
    implementation: [
      'Built a labelled evaluation set from historical tickets, including the ambiguous ones',
      'Implemented classification with per-field confidence rather than a single label',
      'Expressed service-level policy as versioned configuration with effective dates',
      'Forced human triage for sensitive categories and for confidence below threshold',
      'Recorded the classification and the rule that fired on every ticket, for service review',
      'Captured reviewer corrections so classification quality is measured over time',
    ],
    outcomes: [
      {
        label: 'Triage consistency',
        value: 'Independent of who is on the queue',
      },
      {
        label: 'Explainability',
        value: 'Every routing decision records its classification and the rule that fired',
      },
      {
        label: 'Sensitive requests',
        value: 'Always routed to a person, regardless of model confidence',
      },
      {
        label: 'Quality measurement',
        value: 'Classification accuracy tracked continuously from reviewer corrections',
      },
    ],
    lessonsLearned: [
      'The ambiguous tickets in the evaluation set were the valuable ones. A set built from clear-cut examples would have overstated accuracy considerably.',
      'Making the service-level policy configuration rather than code removed the main source of change requests after go-live.',
      'Capturing reviewer corrections cost little and turned quality from an assumption into a measurement.',
    ],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Redis', 'Docker'],
    relatedServiceSlugs: ['intelligent-automation', 'nlp', 'ai-agents-agentic-automation'],
    publishedAt: '2026-04-09',
    order: 2,
    seo: {
      description:
        'Demo case study: an illustrative walkthrough of automated service-desk triage combining NLP classification with auditable deterministic routing rules.',
      noIndex: true,
    },
  },
  {
    slug: 'operations-reporting-platform',
    title: 'Operations Reporting Platform',
    kind: 'demo',
    industrySlug: 'manufacturing',
    summary:
      'An illustrative walkthrough of replacing hand-assembled operational reporting with validated pipelines and dashboards built around specific decisions.',
    problem:
      'Operational reporting is assembled manually each week from three systems and a set of spreadsheets. Figures disagree between departments because each calculates the same KPI slightly differently, and by the time a report is read the underlying data is several days old.',
    constraints: [
      'One source system exposes only a nightly file export',
      'Historical spreadsheets contain corrections never applied upstream',
      'Two departments define "throughput" differently and both definitions are in legitimate use',
      'The reporting team has no engineering capacity to maintain a complex platform',
    ],
    approach:
      'The first deliverable was not a dashboard but an agreed metric dictionary. Where two definitions were both legitimate, both were modelled explicitly with distinct names rather than one being declared correct. Pipelines validate at each boundary and halt rather than writing partial data, because a visibly missing figure is far less damaging than a plausible wrong one.',
    architecture: [
      'Ingestion adapters for API, database and nightly file sources',
      'Validation at each boundary: schema, row count, referential integrity and business rules',
      'Modelled metric layer where each KPI is defined once and reused',
      'Scheduled orchestration with idempotent, re-runnable jobs',
      'Dashboards scoped per audience, displaying data freshness alongside figures',
      'Pipeline freshness and row counts exported as monitored metrics',
    ],
    implementation: [
      'Produced a metric dictionary agreed with both departments before building anything',
      'Modelled the two throughput definitions separately, under distinct names',
      'Implemented validation that halts the pipeline rather than writing partial data',
      'Made every job idempotent so a re-run after a fix produces a correct result',
      'Displayed data freshness on every dashboard view',
      'Exported pipeline health to monitoring with alerting on staleness',
    ],
    outcomes: [
      {
        label: 'Metric definitions',
        value: 'One documented definition per KPI, reused across every view',
      },
      {
        label: 'Report assembly',
        value: 'Automated, removing the recurring manual build',
      },
      {
        label: 'Data quality',
        value: 'Incomplete loads halt visibly instead of producing plausible wrong figures',
      },
      {
        label: 'Freshness',
        value: 'Shown on every view, so no figure is mistaken for current',
      },
    ],
    lessonsLearned: [
      'The metric dictionary resolved more disagreement than the dashboards did. Most of the conflict was definitional, not technical.',
      'Modelling both throughput definitions rather than picking one avoided a political argument that would have stalled the project.',
      'Showing data freshness on the dashboard eliminated most "is this current?" questions immediately.',
    ],
    technologies: ['Python', 'PostgreSQL', 'SQL', 'Celery', 'Grafana', 'Prometheus', 'Docker'],
    relatedServiceSlugs: [
      'data-engineering-etl',
      'business-intelligence-dashboards',
      'reporting-automation',
    ],
    publishedAt: '2026-05-21',
    order: 3,
    seo: {
      description:
        'Demo case study: an illustrative walkthrough of replacing manual operational reporting with validated data pipelines and decision-focused dashboards.',
      noIndex: true,
    },
  },
  {
    slug: 'knowledge-assistant-support-operations',
    title: 'Grounded Knowledge Assistant for Support Operations',
    kind: 'demo',
    industrySlug: 'enterprise-it',
    summary:
      'An illustrative walkthrough of a retrieval-grounded assistant that answers from approved internal content, cites sources and declines when uncertain.',
    problem:
      'Support staff answer the same questions repeatedly by searching across a wiki, a document store and historical tickets. Answers vary by who is asked, and new staff take a long time to become productive because the knowledge is distributed rather than documented in one place.',
    constraints: [
      'Some documentation is restricted to particular roles and must not surface to others',
      'An invented answer would be worse than no answer, given the systems involved',
      'Content is updated frequently and the index must not serve stale answers',
      'No content may leave the organisation’s infrastructure',
    ],
    approach:
      'Access control is applied at retrieval time rather than filtering after generation, so restricted content never reaches the model for a user who may not see it. Answers are generated strictly from retrieved passages and always carry citations. When retrieval returns nothing sufficiently relevant, the assistant says so and offers a route to a person — which turned out to be the feature that earned staff trust.',
    architecture: [
      'Ingestion pipeline chunking approved content and storing embeddings with access-control metadata',
      'Retrieval filtered by the asker’s permissions before ranking',
      'Generation constrained to retrieved passages, with citations',
      'Confidence threshold below which the assistant declines and escalates',
      'Self-hosted open-weight model so no content leaves the organisation',
      'Unanswered-question log producing a content gap list',
    ],
    implementation: [
      'Agreed the in-scope content set and the question types the assistant should decline',
      'Stored access-control metadata alongside each embedded chunk',
      'Applied permission filtering at retrieval, before ranking',
      'Required citations on every answer, linking back to the source passage',
      'Implemented an explicit decline path with escalation to a person',
      'Scheduled re-indexing so updated content is reflected promptly',
    ],
    outcomes: [
      {
        label: 'Answer grounding',
        value: 'Every answer cites the source passage it came from',
      },
      {
        label: 'Access control',
        value: 'Enforced at retrieval, so restricted content cannot reach an unauthorised answer',
      },
      {
        label: 'Uncertainty handling',
        value: 'Declines and escalates rather than generating a plausible answer',
      },
      {
        label: 'Content improvement',
        value: 'Unanswered questions produce a prioritised documentation gap list',
      },
    ],
    lessonsLearned: [
      'The decline path was what earned trust. Staff stopped double-checking answers once they saw the assistant admit when it did not know.',
      'Applying permissions at retrieval rather than after generation was both simpler and safer than the alternative.',
      'The content gap list proved more valuable to the organisation than the assistant itself.',
    ],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Open-weight LLMs', 'Docker'],
    relatedServiceSlugs: ['generative-ai-solutions', 'nlp', 'ai-consulting-integration'],
    publishedAt: '2026-06-30',
    order: 4,
    seo: {
      description:
        'Demo case study: an illustrative walkthrough of a retrieval-grounded knowledge assistant with citations, retrieval-time access control and an explicit decline path.',
      noIndex: true,
    },
  },
];

export const caseStudyBySlug = new Map(caseStudies.map((c) => [c.slug, c]));
