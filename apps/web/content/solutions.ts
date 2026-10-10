import type { Solution } from '@nevix/types';

/**
 * Solutions — outcome-oriented patterns (specification §8, instruction §20).
 *
 * A service answers "what can NEVIX build?". A solution answers "how can NEVIX solve a
 * business problem?". Every solution here is composed only of services that appear in the
 * catalogue — nothing is presented that the documented capabilities do not support.
 *
 * DUMMY-DATA: DD-012
 * `illustrativeOutcomes` describe the kind of result these patterns are designed to produce.
 * They are rendered under a visible "illustrative, not a guarantee" note because specification
 * §31 forbids guaranteed ROI or performance claims. Replace with measured outcomes from approved
 * engagements once evidence exists.
 */
export const solutions: Solution[] = [
  {
    slug: 'ai-document-processing',
    name: 'AI-Powered Document Processing',
    problem:
      'High volumes of invoices, forms and applications arrive in inconsistent formats and are keyed in by hand, carrying errors into finance, operations and reporting.',
    summary:
      'Classify, extract and validate document data automatically, routing only the uncertain cases to a person.',
    heroTitle: 'Documents processed automatically, exceptions routed to people',
    heroDescription:
      'An ingestion pipeline that classifies each document, extracts the fields that matter with a confidence score, validates them against your business rules, and sends only the uncertain cases for human review.',
    workflow: [
      {
        title: 'Ingest',
        description:
          'Documents arrive by email, upload, shared folder or API and are stored with their original form retained for audit.',
      },
      {
        title: 'Classify',
        description:
          'Each document is identified by type so the right extraction template and validation rules apply.',
      },
      {
        title: 'Extract',
        description:
          'Fields are extracted with a per-field confidence score, using structured parsing, OCR or a language model depending on the document.',
      },
      {
        title: 'Validate',
        description:
          'Extracted values are checked against business rules and reference data — totals, supplier records, date ranges, mandatory fields.',
      },
      {
        title: 'Route',
        description:
          'Documents passing validation continue automatically. Those below the confidence threshold or failing a rule go to a reviewer with the specific problem highlighted.',
      },
      {
        title: 'Deliver',
        description:
          'Validated, structured data is written to your finance, ERP or operational system, linked back to the source document.',
      },
    ],
    technicalApproach: [
      'Layered extraction: structured parsing where the format allows, OCR where it does not, language models for genuinely variable documents',
      'Per-field confidence scores driving an explicit, configurable review threshold',
      'Validation against business rules before anything is written downstream',
      'Original documents retained in object storage and linked to every extracted record',
      'Structured audit log from source document to written record',
    ],
    illustrativeOutcomes: [
      'Manual keying reduced to the documents that genuinely need a human decision',
      'Errors caught by validation before they reach downstream systems',
      'A traceable link from every figure back to its source document',
      'Processing capacity that does not scale linearly with headcount',
    ],
    relatedServiceSlugs: [
      'document-intelligence',
      'intelligent-automation',
      'business-process-automation',
      'api-integration-orchestration',
    ],
    relatedIndustrySlugs: ['government-public-sector', 'finance', 'healthcare'],
    icon: 'file-text',
    order: 1,
    seo: {
      description:
        'Classify, extract and validate document data automatically with confidence scoring, business-rule validation and human review for uncertain cases.',
    },
  },
  {
    slug: 'intelligent-ticket-triage',
    name: 'Intelligent Ticket Triage',
    problem:
      'Support and service-desk queues are triaged manually. Tickets sit unclassified, urgent items are missed among routine ones, and routing depends on whoever is reading the queue.',
    summary:
      'Classify, prioritise and route incoming tickets automatically, with the routing decision kept in auditable rules.',
    heroTitle: 'Every ticket classified, prioritised and routed on arrival',
    heroDescription:
      'AI reads the unstructured request and produces structured fields; deterministic rules decide priority and destination. Consistent triage without an unexplainable decision.',
    workflow: [
      {
        title: 'Capture',
        description:
          'Tickets arrive from email, a portal, chat or an API and enter a single queue.',
      },
      {
        title: 'Understand',
        description:
          'The request text is classified by category, intent and urgency signals, and key entities — system, location, account, reference — are extracted.',
      },
      {
        title: 'Decide',
        description:
          'Deterministic rules combine the extracted fields with your service-level policy to set priority and destination. The same input always produces the same decision.',
      },
      {
        title: 'Route',
        description:
          'The ticket is assigned to the right queue or team, with the classification and the reasoning attached.',
      },
      {
        title: 'Escalate',
        description:
          'Low-confidence classifications and items matching sensitive categories go to a human triager rather than being routed automatically.',
      },
      {
        title: 'Learn',
        description:
          'Reviewer corrections are captured as labelled data, so classification quality is measured over time rather than assumed.',
      },
    ],
    technicalApproach: [
      'NLP classification and entity extraction producing structured fields with confidence scores',
      'Routing decisions in deterministic, auditable rules — never inside the model',
      'Confidence thresholds routing uncertain tickets to human triage',
      'Reviewer corrections captured as labelled evaluation data',
      'Separate monitoring for classification quality and ticket volume',
    ],
    illustrativeOutcomes: [
      'Consistent triage regardless of who is on the queue',
      'Urgent items identified on arrival rather than on review',
      'An explainable reason recorded for every routing decision',
      'A measured view of classification quality that improves with corrections',
    ],
    relatedServiceSlugs: [
      'intelligent-automation',
      'nlp',
      'ai-agents-agentic-automation',
      'workflow-automation',
    ],
    relatedIndustrySlugs: ['enterprise-it', 'government-public-sector'],
    icon: 'inbox',
    order: 2,
    seo: {
      description:
        'Classify, prioritise and route incoming support tickets automatically with NLP classification, deterministic routing rules and human escalation for uncertain cases.',
    },
  },
  {
    slug: 'business-workflow-automation',
    name: 'Business Workflow Automation',
    problem:
      'Requests move between email, spreadsheets and separate systems. Nobody can say where an item is without asking, approvals live in inboxes, and work stalls in the gaps.',
    summary:
      'One workflow with explicit states, role-based approvals, notifications and a queryable status for every item.',
    heroTitle: 'One workflow, one status, one audit trail',
    heroDescription:
      'Model the process as explicit states and transitions, enforce who may do what, and make "where is this?" a query rather than a conversation.',
    workflow: [
      {
        title: 'Map',
        description:
          'Discovery captures the process as actually performed, including the exceptions and workarounds that are not in the documentation.',
      },
      {
        title: 'Model',
        description:
          'The process becomes explicit states and transitions, with rules for who may perform each one and what happens on timeout.',
      },
      {
        title: 'Automate',
        description:
          'Mechanical steps — data movement, document generation, system updates, notifications — run without a person.',
      },
      {
        title: 'Approve',
        description:
          'Approvals happen inside the workflow, recorded with actor, timestamp and comment, rather than in email.',
      },
      {
        title: 'Track',
        description:
          'Every item has one unambiguous status and a full history, visible to anyone with the right role.',
      },
      {
        title: 'Escalate',
        description:
          'Items that stall past their threshold escalate automatically to a named owner rather than waiting to be noticed.',
      },
    ],
    technicalApproach: [
      'Persisted state machine rather than scripts on a schedule, so runs are inspectable and resumable',
      'Role-based permissions enforced server-side on every transition',
      'Timeouts and escalation defined per state',
      'Every transition recorded with actor, timestamp and reason',
      'Structured logging with a correlation identifier per item',
    ],
    illustrativeOutcomes: [
      'Status answerable without asking anyone',
      'Approvals recorded with a defensible audit trail',
      'Stalled work escalated automatically',
      'Handoffs between teams that no longer depend on email',
    ],
    relatedServiceSlugs: [
      'workflow-automation',
      'business-process-automation',
      'api-integration-orchestration',
      'web-application-development',
    ],
    relatedIndustrySlugs: ['government-public-sector', 'manufacturing', 'enterprise-it'],
    icon: 'workflow',
    order: 3,
    seo: {
      description:
        'Turn fragmented processes into one workflow with explicit states, role-based approvals, notifications, escalation and a queryable status for every item.',
    },
  },
  {
    slug: 'ai-knowledge-assistant',
    name: 'AI Knowledge Assistant',
    problem:
      'Institutional knowledge is spread across documents, wikis, tickets and people. Answering a routine question means knowing who to ask, and the same questions are answered repeatedly.',
    summary:
      'A retrieval-grounded assistant that answers from your approved content and cites its sources.',
    heroTitle: 'Answers grounded in your own documents, with citations',
    heroDescription:
      'A knowledge assistant that retrieves from approved internal content, answers with citations, and declines when the answer is not in the source material — rather than inventing one.',
    workflow: [
      {
        title: 'Define scope',
        description:
          'Agree which content is in scope, who may access what, and which question types the assistant should decline.',
      },
      {
        title: 'Index',
        description:
          'Approved documents are chunked and embedded into a vector index alongside their access-control metadata.',
      },
      {
        title: 'Retrieve',
        description:
          'A question retrieves the most relevant passages the asker is permitted to see. Permissions are applied at retrieval, not after.',
      },
      {
        title: 'Answer',
        description:
          'The model answers from the retrieved passages only, with citations back to the source documents.',
      },
      {
        title: 'Decline',
        description:
          'When retrieval returns nothing sufficiently relevant, the assistant says so and offers a route to a person rather than generating a plausible answer.',
      },
      {
        title: 'Improve',
        description:
          'Unanswered questions are logged as a content gap list, which is usually more valuable than the assistant itself.',
      },
    ],
    technicalApproach: [
      'Retrieval-augmented generation grounded strictly in approved content',
      'Access control applied at retrieval time, so answers cannot leak restricted material',
      'Citations on every answer, linking back to the source passage',
      'An explicit decline path when retrieval confidence is insufficient',
      'pgvector alongside the existing PostgreSQL database rather than a separate vector store',
    ],
    illustrativeOutcomes: [
      'Routine questions answered without interrupting a subject-matter expert',
      'Answers traceable to a source document',
      'Restricted content that stays restricted, enforced at retrieval',
      'A measured list of questions your documentation does not answer',
    ],
    relatedServiceSlugs: [
      'generative-ai-solutions',
      'nlp',
      'ai-consulting-integration',
      'backend-api-development',
    ],
    relatedIndustrySlugs: ['enterprise-it', 'education', 'government-public-sector'],
    icon: 'book-open',
    order: 4,
    seo: {
      description:
        'A retrieval-grounded AI knowledge assistant that answers from your approved content with citations, applies access control at retrieval and declines when uncertain.',
    },
  },
  {
    slug: 'operational-dashboards',
    name: 'Operational Dashboards',
    problem:
      'Reporting is assembled by hand from several systems. Figures disagree between teams, numbers are days old by the time they are read, and nobody is sure which version is authoritative.',
    summary:
      'Validated pipelines feeding dashboards with agreed metric definitions and visible data freshness.',
    heroTitle: 'One agreed set of numbers, refreshed automatically',
    heroDescription:
      'Validated data pipelines feeding dashboards built around specific decisions, with each metric defined once and data freshness shown on the view itself.',
    workflow: [
      {
        title: 'Agree the decisions',
        description:
          'Identify which decisions the dashboard supports and who makes them. Metrics that support no decision are left out.',
      },
      {
        title: 'Define metrics',
        description:
          'Each KPI gets one documented definition — calculation, source, grain and refresh cadence — so the same name cannot mean two things.',
      },
      {
        title: 'Build pipelines',
        description:
          'Ingestion and transformation run on a schedule with validation at each boundary, halting rather than writing partial data.',
      },
      {
        title: 'Model',
        description:
          'Metrics are calculated once in a modelled layer and reused, rather than reimplemented per dashboard.',
      },
      {
        title: 'Visualise',
        description:
          'Each view is designed for one audience, showing data freshness alongside the figures.',
      },
      {
        title: 'Monitor',
        description:
          'Pipeline freshness and row counts are exported as metrics, so a silent upstream change is detected rather than discovered in a meeting.',
      },
    ],
    technicalApproach: [
      'Validation at every pipeline boundary, halting on failure rather than writing partial data',
      'Idempotent, re-runnable pipelines',
      'One modelled metric definition reused across every view',
      'Data freshness displayed on the dashboard itself',
      'Pipeline health exported to monitoring',
    ],
    illustrativeOutcomes: [
      'One authoritative figure per metric across teams',
      'Reporting that refreshes without manual assembly',
      'Stale or incomplete data visible rather than silently presented as current',
      'Upstream data problems detected by monitoring',
    ],
    relatedServiceSlugs: [
      'business-intelligence-dashboards',
      'data-engineering-etl',
      'reporting-automation',
      'data-analytics',
    ],
    relatedIndustrySlugs: ['manufacturing', 'government-public-sector', 'healthcare', 'finance'],
    icon: 'gauge',
    order: 5,
    seo: {
      description:
        'Validated data pipelines feeding operational dashboards with one agreed definition per metric, visible data freshness and monitored pipeline health.',
    },
  },
  {
    slug: 'custom-digital-portals',
    name: 'Custom Digital Portals',
    problem:
      'Citizens, customers or partners interact through forms, email and phone. Submissions are re-keyed internally, applicants cannot see progress, and staff spend their time answering status questions.',
    summary:
      'An accessible portal where users submit, track and complete work, connected to the internal workflow behind it.',
    heroTitle: 'A portal that removes the status phone call',
    heroDescription:
      'An accessible, responsive portal for submission and self-service tracking, connected directly to the internal workflow so applicants see real progress rather than an acknowledgement.',
    workflow: [
      {
        title: 'Design the journey',
        description:
          'Map the user journey including error and edge cases, and design against WCAG 2.2 AA principles from the start.',
      },
      {
        title: 'Build submission',
        description:
          'Structured forms with client and server validation, progressive saving, and file upload with type and size restrictions.',
      },
      {
        title: 'Connect the workflow',
        description:
          'Submissions enter the internal workflow directly, eliminating the re-keying step entirely.',
      },
      {
        title: 'Expose status',
        description:
          'Applicants see where their submission is and what happens next, drawn from the same workflow state staff see.',
      },
      {
        title: 'Notify',
        description:
          'State changes trigger notifications, so users are informed rather than having to check.',
      },
      {
        title: 'Report',
        description:
          'Volume, processing time and bottleneck data feed operational reporting without a separate collection exercise.',
      },
    ],
    technicalApproach: [
      'Server-rendered pages with minimal client-side JavaScript for fast, reliable loading',
      'WCAG 2.2 AA principles applied during design and build',
      'Client and server validation, with accessible inline error messages',
      'Upload restrictions on type and size, with files stored under access control',
      'The same workflow state powering both the applicant view and the staff view',
    ],
    illustrativeOutcomes: [
      'Submissions entering the workflow without re-keying',
      'Status questions answered by the portal rather than by staff',
      'Accessible submission for users on any device or assistive technology',
      'Processing-time data available without a separate collection exercise',
    ],
    relatedServiceSlugs: [
      'web-application-development',
      'website-development',
      'ui-ux-design',
      'workflow-automation',
    ],
    relatedIndustrySlugs: ['government-public-sector', 'education', 'healthcare'],
    icon: 'layout-panel-left',
    order: 6,
    seo: {
      description:
        'Accessible digital portals for submission and self-service tracking, connected directly to the internal workflow so status is visible without staff intervention.',
    },
  },
  {
    slug: 'ai-enabled-internal-tools',
    name: 'AI-Enabled Internal Tools',
    problem:
      'Operational teams work across several systems, assembling context by hand before every decision. The information exists; gathering it is the job.',
    summary:
      'Role-based internal tools that assemble the context a decision needs, with AI handling the unstructured parts.',
    heroTitle: 'Bring the context to the decision',
    heroDescription:
      'Internal tools that gather the records, documents and history relevant to a case, summarise the unstructured parts, and leave the decision — and the audit trail — with the person.',
    workflow: [
      {
        title: 'Identify the decision',
        description:
          'Determine which recurring decision the tool supports and what information the person currently assembles by hand.',
      },
      {
        title: 'Integrate sources',
        description:
          'Connect the systems holding that information, respecting each one’s access model.',
      },
      {
        title: 'Assemble context',
        description:
          'The tool gathers the relevant records, documents and history for a case into one view.',
      },
      {
        title: 'Summarise',
        description:
          'AI summarises the unstructured portion — correspondence, notes, documents — with citations back to the source.',
      },
      {
        title: 'Decide',
        description:
          'The person makes the decision with full context. The tool records it, with its reasoning, as an audit entry.',
      },
      {
        title: 'Act',
        description:
          'Approved actions are executed against the connected systems through the tool, rather than re-entered manually.',
      },
    ],
    technicalApproach: [
      'Role-based access enforced server-side, respecting each source system’s permissions',
      'AI used for summarisation and extraction, never for the decision itself',
      'Citations linking every summarised statement to its source',
      'Append-only audit log of decisions and actions',
      'Actions executed through integrations rather than manual re-entry',
    ],
    illustrativeOutcomes: [
      'Context assembled automatically instead of by hand',
      'Decisions recorded with their supporting evidence',
      'Reduced switching between systems during a single case',
      'An audit trail that falls out of normal use',
    ],
    relatedServiceSlugs: [
      'internal-tools-portals',
      'ai-agents-agentic-automation',
      'web-application-development',
      'api-integration-orchestration',
    ],
    relatedIndustrySlugs: ['enterprise-it', 'finance', 'healthcare'],
    icon: 'panels-top-left',
    order: 7,
    seo: {
      description:
        'Role-based internal tools that assemble decision context across systems, with AI summarising unstructured content and the decision remaining with the person.',
    },
  },
  {
    slug: 'infrastructure-automation',
    name: 'Infrastructure & Operations Automation',
    problem:
      'Servers are configured by hand and drift apart. Routine operational jobs run from someone’s crontab, and rebuilding a host is an archaeology exercise.',
    summary:
      'Configuration as reviewable code, scheduled operational jobs with visible history, and rebuildable hosts.',
    heroTitle: 'Infrastructure you can rebuild from source control',
    heroDescription:
      'Configuration expressed as idempotent, reviewable code, with routine operational jobs running on a schedule and alerting when they fail.',
    workflow: [
      {
        title: 'Inventory',
        description:
          'Catalogue the existing hosts, their configuration and the operational jobs currently running informally.',
      },
      {
        title: 'Codify',
        description:
          'Express configuration as idempotent playbooks so re-running is safe and changes are reviewable.',
      },
      {
        title: 'Externalise secrets',
        description:
          'Move credentials into a secret store, out of scripts, shell history and the repository.',
      },
      {
        title: 'Schedule',
        description:
          'Move routine jobs onto a scheduler with visible run history and alerting on failure.',
      },
      {
        title: 'Verify',
        description: 'Prove a host can be rebuilt from source control, rather than assuming it.',
      },
      {
        title: 'Monitor',
        description:
          'Export host and job metrics so drift, failure and capacity problems are visible before they cause an outage.',
      },
    ],
    technicalApproach: [
      'Idempotent Ansible playbooks, safe to re-run',
      'Secrets held in a vault, never in the repository',
      'Changes reviewed before they reach production',
      'Scheduled jobs with retained run history and failure alerting',
      'Host and job metrics exported to Prometheus',
    ],
    illustrativeOutcomes: [
      'Hosts rebuildable from source control rather than from memory',
      'Configuration changes reviewable before they are applied',
      'Job failures that alert instead of passing unnoticed',
      'Operational knowledge in the repository rather than with one person',
    ],
    relatedServiceSlugs: [
      'infrastructure-it-automation',
      'cloud-devops-engineering',
      'python-automation',
    ],
    relatedIndustrySlugs: ['enterprise-it', 'government-public-sector'],
    icon: 'server-cog',
    order: 8,
    seo: {
      description:
        'Infrastructure and operations automation: configuration as reviewable idempotent code, secrets in a vault, scheduled jobs with alerting, and rebuildable hosts.',
    },
  },
  {
    slug: 'document-to-workflow',
    name: 'Document-to-Workflow Systems',
    problem:
      'A document arrives and triggers a process — an application to assess, an invoice to approve, a form to action. Today someone reads it, decides what it is, and starts the process by hand.',
    summary:
      'Documents that start the right workflow automatically, with the extracted data already populated.',
    heroTitle: 'The document starts the process, already populated',
    heroDescription:
      'Combining document intelligence with workflow automation: an arriving document is classified, extracted, validated, and starts the correct workflow with its data already in place.',
    workflow: [
      {
        title: 'Receive',
        description: 'Documents arrive by email, upload or API into a single intake point.',
      },
      {
        title: 'Understand',
        description:
          'Classification determines the document type and therefore which process it belongs to.',
      },
      {
        title: 'Extract and validate',
        description:
          'Relevant fields are extracted with confidence scores and validated against business rules and reference data.',
      },
      {
        title: 'Initiate',
        description:
          'The correct workflow starts automatically, pre-populated with the validated data and linked to the source document.',
      },
      {
        title: 'Review where needed',
        description:
          'Low-confidence extractions and rule failures are reviewed by a person before the workflow proceeds.',
      },
      {
        title: 'Complete',
        description:
          'The workflow runs to completion with approvals, notifications and a full audit trail from document to outcome.',
      },
    ],
    technicalApproach: [
      'Document classification determining workflow routing',
      'Field extraction with confidence scores and business-rule validation',
      'Deterministic rules deciding the workflow, never the model',
      'Source document linked to the workflow instance throughout',
      'End-to-end audit trail from arrival to outcome',
    ],
    illustrativeOutcomes: [
      'Processes starting on document arrival rather than on someone noticing',
      'Workflow data populated from the document instead of re-keyed',
      'Human attention focused on exceptions',
      'A complete audit trail from document to outcome',
    ],
    relatedServiceSlugs: [
      'document-intelligence',
      'intelligent-automation',
      'workflow-automation',
      'business-process-automation',
    ],
    relatedIndustrySlugs: ['government-public-sector', 'finance', 'healthcare'],
    icon: 'file-cog',
    order: 9,
    seo: {
      description:
        'Document-to-workflow systems: arriving documents are classified, extracted and validated, then start the correct workflow already populated with their data.',
    },
  },
  {
    slug: 'data-driven-decision-platform',
    name: 'Data-Driven Decision Platform',
    problem:
      'Prioritisation and allocation decisions are made on experience and whatever report is to hand. Outcomes are inconsistent between people, and there is no record of why a given decision was made.',
    summary:
      'Transparent scoring that combines data, rules and prediction to support a decision the person still makes.',
    heroTitle: 'Support the decision, and record why it was made',
    heroDescription:
      'Scoring and prioritisation that shows its working — which factors contributed, in which direction — with policy weights owned by the people accountable for the policy.',
    workflow: [
      {
        title: 'Define the decision',
        description:
          'Establish precisely what is being decided, by whom, and what a good outcome looks like.',
      },
      {
        title: 'Assemble the data',
        description: 'Build validated pipelines for the factors the decision depends on.',
      },
      {
        title: 'Model factors',
        description:
          'Calculate each contributing factor separately, including predicted values where prediction genuinely helps.',
      },
      {
        title: 'Apply policy',
        description:
          'Weighting and thresholds are held as configurable policy, adjustable by the accountable owner without an engineering change.',
      },
      {
        title: 'Present',
        description:
          'The recommendation is shown with its contributing factors and their direction, so the person can agree or override with reasons.',
      },
      {
        title: 'Record',
        description:
          'Every score is stored with the factor values that produced it, so past decisions remain explainable.',
      },
    ],
    technicalApproach: [
      'Factor calculation separated from weighting policy',
      'Predictions reported with intervals rather than as point facts',
      'Policy weights versioned with effective dates',
      'Scores stored with their contributing factor values',
      'Overrides captured with a recorded reason',
    ],
    illustrativeOutcomes: [
      'Consistent prioritisation across people and shifts',
      'Recommendations that can be explained to the person affected',
      'Policy changes made by the policy owner, not by engineering',
      'Past decisions still explainable months later',
    ],
    relatedServiceSlugs: [
      'decision-intelligence',
      'predictive-analytics',
      'machine-learning',
      'business-intelligence-dashboards',
    ],
    relatedIndustrySlugs: ['government-public-sector', 'finance', 'manufacturing'],
    icon: 'scale',
    order: 10,
    seo: {
      description:
        'A decision-support platform combining validated data, configurable policy rules and prediction, with transparent scoring and an explainable decision record.',
    },
  },
];

export const solutionBySlug = new Map(solutions.map((s) => [s.slug, s]));
