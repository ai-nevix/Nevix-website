import type { Industry } from '@nevix/types';

/**
 * Industries — specification §8.1, catalogue §8.
 *
 * Content governance: these pages describe the operational context NEVIX works in and the
 * capabilities it can bring. They do NOT claim sector credentials, certifications, approvals,
 * empanelments or existing client relationships. Government is a target market, not a claim of
 * government endorsement (catalogue §8, specification §31).
 */
export const industries: Industry[] = [
  {
    slug: 'government-public-sector',
    name: 'Government & Public Sector',
    summary:
      'Citizen-facing services, departmental workflow automation, analytics platforms and controlled AI — built to public-sector accessibility and access-control expectations.',
    heroTitle: 'Supporting digital initiatives in the public sector',
    heroDescription:
      'Government is a target market for NEVIX. The capability areas below describe what we can build for public-sector digital initiatives — accessible citizen services, departmental workflow automation, analytics platforms and carefully governed AI.',
    context:
      'Public-sector digital work carries constraints that shape engineering from the first decision: accessibility is a requirement rather than a goal, data handling and residency are governed, procurement favours transparent and portable technology, and systems are expected to outlive the teams that build them. Our default stack is open source and self-hostable specifically because those constraints reward it.',
    capabilityAreas: [
      {
        title: 'Citizen-facing digital services',
        description:
          'Portals, applications, forms and accessible experiences that work on any device and with assistive technology.',
      },
      {
        title: 'Department workflow automation',
        description:
          'Routing, approvals, notifications and repetitive administration, with an audit trail on every transition.',
      },
      {
        title: 'Data and analytics platforms',
        description:
          'Dashboards, reporting, integration and decision support built on validated pipelines.',
      },
      {
        title: 'AI-enabled public services',
        description:
          'Document intelligence, classification and controlled information assistants, with human oversight where decisions affect people.',
      },
      {
        title: 'Infrastructure and operations automation',
        description:
          'Repeatable server, configuration and job automation, expressed as reviewable code.',
      },
      {
        title: 'Custom software and modernization',
        description:
          'Modern applications, APIs and integrations replacing manual or legacy processes.',
      },
    ],
    considerations: [
      'Accessibility to WCAG 2.2 AA principles designed in from the start, not audited afterwards',
      'Self-hostable, open-source stack — no dependency on a single commercial platform',
      'Role-based access control and audit trails on privileged actions',
      'Data residency and retention handled as an architecture decision',
      'Documentation and handover that let an in-house or successor team take ownership',
      'Human oversight retained wherever an automated decision affects a person',
    ],
    relatedServiceSlugs: [
      'website-development',
      'workflow-automation',
      'document-intelligence',
      'business-intelligence-dashboards',
      'ui-ux-design',
      'infrastructure-it-automation',
    ],
    relatedSolutionSlugs: [
      'custom-digital-portals',
      'business-workflow-automation',
      'document-to-workflow',
      'operational-dashboards',
    ],
    icon: 'landmark',
    order: 1,
    requiresComplianceNotice: true,
    seo: {
      description:
        'NEVIX supports public-sector digital initiatives with citizen-facing services, departmental workflow automation, analytics platforms and carefully governed AI.',
    },
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    summary:
      'Administrative workflow automation, document processing and operational reporting for healthcare organisations — with clinical decisions left to clinicians.',
    heroTitle: 'Reducing administrative load, not clinical judgement',
    heroDescription:
      'Healthcare organisations carry substantial administrative burden alongside clinical work. NEVIX focuses on the administrative and operational layer: referrals, documentation, scheduling data, reporting and system integration.',
    context:
      'Healthcare data is sensitive, systems are heterogeneous, and the cost of an error is measured in patient impact rather than efficiency. We scope carefully: administrative and operational automation, document processing and reporting. We do not build clinical decision systems, and we say so plainly rather than stretching a capability to fit a brief.',
    capabilityAreas: [
      {
        title: 'Administrative workflow automation',
        description:
          'Referrals, approvals, scheduling administration and internal routing with a full audit trail.',
      },
      {
        title: 'Document and form processing',
        description:
          'Extraction and validation from referral letters, forms and operational documents, with human review on anything uncertain.',
      },
      {
        title: 'Operational reporting',
        description:
          'Capacity, throughput and administrative performance reporting on validated data pipelines.',
      },
      {
        title: 'System integration',
        description:
          'Reliable integration between administrative systems, with idempotent, auditable data movement.',
      },
    ],
    considerations: [
      'Sensitive personal data handled with role-scoped access and audit logging',
      'Self-hosted deployment so patient-related data need not leave your infrastructure',
      'Human review on every automated step that touches a patient record',
      'Scope limited to administrative and operational work — clinical decisions stay with clinicians',
    ],
    relatedServiceSlugs: [
      'document-intelligence',
      'workflow-automation',
      'business-intelligence-dashboards',
      'api-integration-orchestration',
    ],
    relatedSolutionSlugs: [
      'ai-document-processing',
      'business-workflow-automation',
      'operational-dashboards',
    ],
    icon: 'heart-pulse',
    order: 2,
    requiresComplianceNotice: true,
    seo: {
      description:
        'NEVIX builds administrative workflow automation, document processing and operational reporting for healthcare organisations, with human oversight throughout.',
    },
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    summary:
      'Production reporting, quality data, visual inspection support and operational automation connecting shop-floor data to decisions.',
    heroTitle: 'Connecting production data to operational decisions',
    heroDescription:
      'Manufacturing generates continuous operational data that frequently stays trapped in individual systems. NEVIX builds the pipelines, reporting and automation that turn it into something teams can act on.',
    context:
      'Manufacturing environments combine long-lived equipment with modern systems, so integration surfaces vary from clean APIs to file drops and legacy databases. Reliability matters more than sophistication: a reporting pipeline that halts visibly is worth far more than one that occasionally produces plausible wrong numbers.',
    capabilityAreas: [
      {
        title: 'Production and operational reporting',
        description:
          'Throughput, downtime and quality reporting from validated pipelines with visible data freshness.',
      },
      {
        title: 'Quality and inspection support',
        description:
          'Computer vision applied to visual inspection, evaluated under real line conditions rather than on clean datasets.',
      },
      {
        title: 'Process and reporting automation',
        description:
          'Recurring data collection, report preparation and distribution without manual assembly.',
      },
      {
        title: 'Predictive analytics',
        description:
          'Demand and resource forecasting with stated prediction intervals rather than point estimates.',
      },
    ],
    considerations: [
      'Integration with heterogeneous equipment and legacy systems, including file and database interfaces',
      'Pipelines that halt visibly rather than producing partial data',
      'Vision systems evaluated under real lighting, angle and throughput conditions',
      'Forecasts reported with their uncertainty rather than as point facts',
    ],
    relatedServiceSlugs: [
      'data-engineering-etl',
      'business-intelligence-dashboards',
      'computer-vision',
      'reporting-automation',
      'predictive-analytics',
    ],
    relatedSolutionSlugs: [
      'operational-dashboards',
      'business-workflow-automation',
      'data-driven-decision-platform',
    ],
    icon: 'factory',
    order: 3,
    seo: {
      description:
        'NEVIX connects manufacturing production data to operational decisions with reporting pipelines, quality and inspection support, and process automation.',
    },
  },
  {
    slug: 'finance',
    name: 'Finance',
    summary:
      'Document processing, reconciliation automation, reporting and explainable decision support for finance functions and financial services.',
    heroTitle: 'Automation with an audit trail attached',
    heroDescription:
      'Finance work is exacting, heavily documented and subject to review. NEVIX builds document processing, reconciliation automation, reporting and decision support where every figure can be traced back to its source.',
    context:
      'In finance, an unexplainable automated decision is not usable regardless of its accuracy. We keep decision logic in auditable rules, retain the evidence behind every derived figure, and design for the reviewer as much as for the operator.',
    capabilityAreas: [
      {
        title: 'Invoice and document processing',
        description:
          'Extraction, validation against reference data, and routing to approval with the source document linked.',
      },
      {
        title: 'Reconciliation automation',
        description:
          'Matching across systems with exceptions surfaced explicitly rather than absorbed.',
      },
      {
        title: 'Reporting automation',
        description:
          'Recurring reports prepared and distributed on schedule, held back when validation fails.',
      },
      {
        title: 'Explainable decision support',
        description:
          'Scoring and prioritisation that shows its contributing factors, with the decision remaining with the person.',
      },
    ],
    considerations: [
      'Decision logic held in auditable rules rather than inside a model',
      'Every derived figure traceable to its source record or document',
      'Validation before distribution, so an incomplete report is held rather than sent',
      'Role-scoped access with audit logging on privileged actions',
      'No guaranteed accuracy or ROI claims — measured performance only',
    ],
    relatedServiceSlugs: [
      'document-intelligence',
      'intelligent-automation',
      'reporting-automation',
      'decision-intelligence',
      'business-process-automation',
    ],
    relatedSolutionSlugs: [
      'ai-document-processing',
      'document-to-workflow',
      'data-driven-decision-platform',
    ],
    icon: 'banknote',
    order: 4,
    requiresComplianceNotice: true,
    seo: {
      description:
        'NEVIX builds document processing, reconciliation automation, reporting and explainable decision support for finance functions, with a full audit trail.',
    },
  },
  {
    slug: 'education',
    name: 'Education',
    summary:
      'Student-facing portals, administrative workflow automation, reporting and knowledge access for educational institutions.',
    heroTitle: 'Administrative systems that do not consume teaching time',
    heroDescription:
      'Educational institutions run substantial administrative operations alongside teaching. NEVIX builds the portals, workflows and reporting that keep administration from consuming academic capacity.',
    context:
      'Education combines high seasonal peaks — admissions, enrolment, results — with limited technical capacity and strong accessibility obligations. Systems need to be operable by administrative staff without engineering support, and accessible to every student.',
    capabilityAreas: [
      {
        title: 'Student and applicant portals',
        description:
          'Accessible submission and self-service status tracking, connected to the internal workflow.',
      },
      {
        title: 'Administrative workflow automation',
        description:
          'Admissions, approvals, document handling and routine administration with visible status.',
      },
      {
        title: 'Reporting and analytics',
        description: 'Enrolment, progression and operational reporting from validated data.',
      },
      {
        title: 'Knowledge access',
        description:
          'Retrieval-grounded assistants answering from approved institutional content, with citations.',
      },
    ],
    considerations: [
      'WCAG 2.2 AA principles applied so every student can use the system',
      'Systems operable by administrative staff without engineering support',
      'Capacity designed for seasonal peaks rather than average load',
      'Self-hostable stack suited to constrained IT budgets',
    ],
    relatedServiceSlugs: [
      'website-development',
      'web-application-development',
      'workflow-automation',
      'generative-ai-solutions',
      'business-intelligence-dashboards',
    ],
    relatedSolutionSlugs: [
      'custom-digital-portals',
      'ai-knowledge-assistant',
      'business-workflow-automation',
    ],
    icon: 'graduation-cap',
    order: 5,
    seo: {
      description:
        'NEVIX builds student-facing portals, administrative workflow automation, reporting and knowledge access for educational institutions.',
    },
  },
  {
    slug: 'enterprise-it',
    name: 'Enterprise & IT',
    summary:
      'Service-desk automation, internal tooling, integration architecture and infrastructure automation for enterprise technology functions.',
    heroTitle: 'Engineering capacity for the work your team cannot get to',
    heroDescription:
      'Enterprise IT functions carry a backlog of integrations, internal tools and automation that never reaches the top of the list. NEVIX delivers that work to the same standard as customer-facing systems.',
    context:
      'Enterprise technology teams are typically constrained by capacity rather than capability. The work that gets deferred — integrations, internal tooling, service-desk automation, infrastructure codification — is exactly the work that compounds into operational load.',
    capabilityAreas: [
      {
        title: 'Service-desk and ticket automation',
        description:
          'Classification, prioritisation and routing on arrival, with auditable routing rules.',
      },
      {
        title: 'Internal tools and portals',
        description:
          'Role-based operational tools built to the same standard as customer-facing systems.',
      },
      {
        title: 'Integration architecture',
        description:
          'Reliable integration between enterprise systems with idempotency, retries and dead-letter handling.',
      },
      {
        title: 'Infrastructure and deployment automation',
        description:
          'Configuration as reviewable code, CI/CD pipelines and rehearsed rollback procedures.',
      },
    ],
    considerations: [
      'Authorisation enforced server-side, including on internal tools',
      'Audit logging on privileged actions regardless of user trust level',
      'Integrations designed for the failure path, not just the happy path',
      'Handover documentation that lets your team own what we build',
    ],
    relatedServiceSlugs: [
      'intelligent-automation',
      'internal-tools-portals',
      'api-integration-orchestration',
      'cloud-devops-engineering',
      'infrastructure-it-automation',
    ],
    relatedSolutionSlugs: [
      'intelligent-ticket-triage',
      'ai-enabled-internal-tools',
      'infrastructure-automation',
      'ai-knowledge-assistant',
    ],
    icon: 'network',
    order: 6,
    seo: {
      description:
        'NEVIX delivers service-desk automation, internal tooling, integration architecture and infrastructure automation for enterprise technology functions.',
    },
  },
];

export const industryBySlug = new Map(industries.map((i) => [i.slug, i]));
