import type { Service } from '@vastrix/types';

/**
 * Automation services — catalogue §3.
 *
 * `capabilities` and `useCases` reproduce the catalogue's "Typical deliverables" and
 * "Typical use cases" verbatim.
 */
export const automationServices: Service[] = [
  {
    slug: 'business-process-automation',
    name: 'Business Process Automation',
    categorySlug: 'automation',
    shortDescription:
      'Map repetitive processes and convert them into controlled automated workflows.',
    heroTitle: 'Automate the process you actually have, not the one on the diagram',
    heroDescription:
      'Process discovery, workflow design, scripts and services, notifications and exception handling — turning repetitive back-office work into a controlled, observable workflow.',
    problemStatement:
      'Processes drift. The documented version and the version people actually follow diverge over years of workarounds and exceptions. Automating the documented version produces a system that breaks on the first real case, and everyone quietly goes back to doing it by hand.',
    whatWeDo:
      'We start with discovery: watching the process as performed, cataloguing the exceptions, and identifying which steps carry real judgement and which are mechanical. We automate the mechanical steps, design explicit handling for the exceptions, and leave the judgement with people. Notifications tell someone when the workflow needs attention rather than failing silently.',
    capabilities: [
      'Process discovery',
      'Workflow design',
      'Scripts and services',
      'Notifications',
      'Exception handling',
    ],
    useCases: ['Data entry', 'Report generation', 'File processing', 'Back-office operations'],
    technologyApproach:
      'Workflows are built as services with a persisted state machine rather than as scripts on a schedule, so a run can be inspected, retried and resumed. Every step writes a structured log entry with a correlation identifier. Failures raise a notification to a named owner rather than an inbox nobody monitors.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Redis', 'Docker'],
    outcomes: [
      'Mechanical steps handled without a person in the loop',
      'Exceptions surfaced explicitly rather than failing silently',
      'A run history that shows what happened and when',
      'A documented process that matches what the system actually does',
    ],
    faq: [
      {
        question: 'What happens to the exceptions we handle manually today?',
        answer:
          'They are catalogued during discovery and handled explicitly — some are automated, some are routed to a person with the relevant context attached, and some turn out to be process problems worth fixing rather than automating. We will tell you which is which.',
      },
      {
        question: 'Do you replace the people doing this work?',
        answer:
          'That is your decision, not ours, and we will not pretend otherwise. What we deliver removes the mechanical portion of the work. In most engagements the people involved move onto the parts of the process that need judgement.',
      },
    ],
    solutionSlugs: ['business-workflow-automation', 'document-to-workflow'],
    caseStudySlugs: ['invoice-to-workflow-automation'],
    order: 1,
    seo: {
      description:
        'VASTRIX maps repetitive business processes and converts them into controlled automated workflows with process discovery, workflow design, notifications and exception handling.',
    },
  },
  {
    slug: 'python-automation',
    name: 'Python Automation',
    categorySlug: 'automation',
    shortDescription: 'Use Python to automate technical, data and operational tasks.',
    heroTitle: 'Scripts that survive being handed to someone else',
    heroDescription:
      'Reusable scripts, schedulers, API integrations, data processing and proper logging and error handling — automation written as software, not as something living on one engineer’s laptop.',
    problemStatement:
      'Most organisations already run on Python scripts. They also usually run on one person who knows where the scripts are, which arguments they take, and what to do when they fail at 3am. That is not automation; it is a dependency.',
    whatWeDo:
      'We turn ad-hoc scripts into maintainable tooling: packaged, configurable through environment variables rather than edited constants, logging in a structured format, failing loudly with actionable errors, and covered by tests for the paths that matter. Scheduled work runs under a scheduler with visible run history.',
    capabilities: [
      'Reusable scripts',
      'Schedulers',
      'API integrations',
      'Data processing',
      'Logging and error handling',
    ],
    useCases: [
      'File processing',
      'System administration',
      'Batch operations',
      'API-based automation',
    ],
    technologyApproach:
      'Configuration comes from the environment, never from edited source. Structured logging with correlation identifiers makes a failed run diagnosable without reproducing it. Retries are bounded and idempotent where the target system allows. Everything ships in a container so the runtime is the same everywhere.',
    technologies: ['Python', 'pandas', 'Celery', 'Redis', 'Docker', 'PostgreSQL'],
    outcomes: [
      'Automation that a second engineer can run and modify',
      'Failures that produce an actionable error rather than silence',
      'Visible run history for scheduled work',
      'No secrets or environment assumptions baked into source',
    ],
    solutionSlugs: ['infrastructure-automation'],
    order: 2,
    seo: {
      description:
        'VASTRIX builds Python automation for technical, data and operational tasks — reusable scripts, schedulers, API integrations and data processing with real logging and error handling.',
    },
  },
  {
    slug: 'workflow-automation',
    name: 'Workflow Automation',
    categorySlug: 'automation',
    shortDescription: 'Connect people, systems, approvals and actions into end-to-end workflows.',
    heroTitle: 'End-to-end workflows, including the human steps',
    heroDescription:
      'Triggers and actions, approvals, notifications, scheduled execution and status tracking — connecting the systems and the people involved in a process into one observable flow.',
    problemStatement:
      'Work stalls in the gaps between systems. A request is approved in email, recorded in a spreadsheet, actioned in a separate tool, and its status is whatever the last person to ask was told. Nobody can answer where a given item is without asking around.',
    whatWeDo:
      'We model the workflow explicitly — states, transitions, who can perform each one, and what happens on timeout — and implement it so every item has an unambiguous current state and a history. Approvals happen inside the workflow rather than in email. Status is a query, not a conversation.',
    capabilities: [
      'Triggers and actions',
      'Approvals',
      'Notifications',
      'Scheduled execution',
      'Status tracking',
    ],
    useCases: ['Onboarding', 'Ticket routing', 'Approvals', 'Operations workflows'],
    technologyApproach:
      'Workflows are persisted state machines with role-based permissions on transitions. Timeouts and escalations are defined per state rather than left to chance. Every transition is recorded with actor, timestamp and reason, which gives you an audit trail without building one separately.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Redis'],
    outcomes: [
      'One unambiguous status per item, queryable at any time',
      'Approvals recorded with actor and timestamp',
      'Defined escalation when a step stalls',
      'An audit trail that falls out of the design rather than being bolted on',
    ],
    solutionSlugs: ['business-workflow-automation', 'custom-digital-portals'],
    order: 3,
    seo: {
      description:
        'VASTRIX connects people, systems, approvals and actions into end-to-end workflows with triggers, notifications, scheduled execution and status tracking.',
    },
  },
  {
    slug: 'rpa-task-automation',
    name: 'RPA & Task Automation',
    categorySlug: 'automation',
    shortDescription:
      'Automate repetitive user-level tasks where direct APIs are unavailable or impractical.',
    heroTitle: 'When there is no API, automate the interface — carefully',
    heroDescription:
      'Rule-based bots, browser and desktop workflows, scheduling and exception handling, for the systems that cannot be integrated any other way.',
    problemStatement:
      'Some systems simply have no integration surface. Legacy applications, vendor portals and internal tools built before anyone thought about APIs still hold data people have to move by hand, screen by screen.',
    whatWeDo:
      'We treat interface automation as a last resort and say so during assessment — an API, a database view or a file export is more robust whenever one exists. Where none does, we build bots with explicit waits rather than fixed sleeps, verification after each step, and failure handling that stops cleanly instead of continuing against an unexpected screen.',
    capabilities: [
      'Rule-based bots',
      'Browser and desktop workflows',
      'Scheduling',
      'Exception handling',
    ],
    useCases: ['Legacy-system data movement', 'Form entry', 'Reconciliation', 'Routine operations'],
    technologyApproach:
      'Bots verify that they are on the expected screen before acting, and abort rather than guess when they are not. Runs are recorded with screenshots at failure points for diagnosis. Credentials come from a secret store, never from the automation script. We monitor for interface changes because vendor UI updates are the main cause of breakage.',
    technologies: ['Python', 'Playwright', 'Docker', 'PostgreSQL'],
    outcomes: [
      'Manual re-keying between systems removed',
      'Clean failure instead of silent corruption when a screen changes',
      'Diagnosable runs with failure-point evidence',
      'Credentials held in a secret store rather than in scripts',
    ],
    faq: [
      {
        question: 'Is RPA a long-term solution?',
        answer:
          'Usually not, and we will tell you so. Interface automation is brittle by nature because it depends on a UI that someone else controls. We use it where no integration surface exists, and we flag it in the architecture as something to replace if an API becomes available.',
      },
    ],
    order: 4,
    seo: {
      description:
        'VASTRIX automates repetitive user-level tasks with rule-based bots and browser or desktop workflows where direct APIs are unavailable or impractical.',
    },
  },
  {
    slug: 'api-integration-orchestration',
    name: 'API Integration & Orchestration',
    categorySlug: 'automation',
    shortDescription: 'Connect independent applications and services reliably.',
    heroTitle: 'Integrations that behave predictably when something is down',
    heroDescription:
      'REST APIs, webhooks, authentication, data transformation, retries and orchestration — built on the assumption that the other system will occasionally be slow, wrong or unavailable.',
    problemStatement:
      'Integrations are usually written for the happy path and then spend their lives in the unhappy one. A timeout, a partial response or a duplicate webhook turns into duplicated records, lost updates or a silent gap nobody notices until reconciliation.',
    whatWeDo:
      'We design for failure explicitly: idempotency keys so a retry cannot duplicate work, bounded exponential backoff, dead-letter handling for messages that cannot be processed, and reconciliation where eventual consistency is not good enough. Transformations are validated against a schema at the boundary so bad data is rejected at the edge rather than absorbed.',
    capabilities: [
      'REST APIs',
      'Webhooks',
      'Authentication',
      'Data transformation',
      'Retries and orchestration',
    ],
    useCases: [
      'CRM and ERP integration',
      'Enterprise integrations',
      'Notification systems',
      'AI service integration',
    ],
    technologyApproach:
      'Every inbound payload is validated against a schema before it is trusted. Outbound calls carry idempotency keys and bounded retries. Webhook endpoints verify signatures. Failed messages go to a dead-letter queue with the original payload retained for replay, rather than being dropped.',
    technologies: ['Python', 'FastAPI', 'Pydantic', 'PostgreSQL', 'Redis', 'Celery'],
    outcomes: [
      'Retries that cannot duplicate work',
      'Schema validation rejecting bad data at the boundary',
      'Failed messages retained and replayable',
      'Integration health visible in monitoring rather than discovered at month end',
    ],
    solutionSlugs: ['business-workflow-automation'],
    order: 5,
    seo: {
      description:
        'VASTRIX connects independent applications and services with REST APIs, webhooks, authentication, data transformation, retries and orchestration.',
    },
  },
  {
    slug: 'infrastructure-it-automation',
    name: 'Infrastructure & IT Automation',
    categorySlug: 'automation',
    shortDescription: 'Automate repeatable infrastructure and system-administration operations.',
    heroTitle: 'Server changes that are repeatable, reviewable and reversible',
    heroDescription:
      'Configuration management, provisioning, Ansible automation, job execution and operational logging — so infrastructure changes are code that can be reviewed rather than commands someone remembers running.',
    problemStatement:
      'Servers configured by hand diverge. Two machines that should be identical are not, nobody knows precisely how they differ, and rebuilding one from scratch is a research project. The knowledge lives in one person’s shell history.',
    whatWeDo:
      'We express configuration as code so that a change is reviewable, repeatable and revertible, and so that rebuilding a host is a command rather than an archaeology exercise. Routine operational jobs run on a schedule with logged output and alerting on failure.',
    capabilities: [
      'Configuration management',
      'Provisioning',
      'Ansible automation',
      'Job execution',
      'Operational logging',
    ],
    useCases: [
      'Server configuration',
      'Deployment jobs',
      'Environment setup',
      'Routine administration',
    ],
    technologyApproach:
      'Ansible playbooks are written to be idempotent so re-running them is safe. Secrets come from a vault rather than from the repository. Changes go through review before they reach production, and every run produces a log that shows what actually changed.',
    technologies: ['Ansible', 'Python', 'Docker', 'Linux', 'Prometheus'],
    outcomes: [
      'Hosts rebuildable from source control',
      'Configuration changes reviewable before they are applied',
      'Scheduled operational jobs with alerting on failure',
      'Infrastructure knowledge in the repository rather than in one person’s head',
    ],
    solutionSlugs: ['infrastructure-automation'],
    order: 6,
    seo: {
      description:
        'VASTRIX automates repeatable infrastructure and system-administration operations with configuration management, provisioning, Ansible automation and operational logging.',
    },
  },
  {
    slug: 'intelligent-automation',
    name: 'Intelligent Automation',
    categorySlug: 'automation',
    shortDescription: 'Combine AI for unstructured inputs with deterministic rules and workflows.',
    heroTitle: 'AI where the input is messy, rules where the decision must be predictable',
    heroDescription:
      'AI classification and extraction combined with deterministic rules, approvals, API actions and monitoring — using each for what it is actually good at.',
    problemStatement:
      'Two failure modes are common. Rule-based automation cannot cope with unstructured input, so it stalls on anything that is not a clean form. Fully AI-driven automation is unpredictable in exactly the places where predictability matters — the decision, the amount, the approval.',
    whatWeDo:
      'We split the problem. AI handles what it is good at: reading unstructured input and turning it into structured fields with a confidence score. Deterministic rules handle the decision, so the same input always produces the same outcome and the logic can be audited. Approvals sit between the two wherever the consequence justifies it.',
    capabilities: [
      'AI classification and extraction',
      'Rules',
      'Approvals',
      'API actions',
      'Monitoring',
    ],
    useCases: [
      'AI ticket triage',
      'Document-to-workflow',
      'Email classification',
      'Intelligent routing',
    ],
    technologyApproach:
      'The AI layer produces structured output with confidence scores and never takes an action directly. A deterministic rules layer consumes that output and decides. Confidence thresholds route uncertain cases to a person. Both layers are monitored separately so a drop in extraction quality is distinguishable from a change in decision volume.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Open-weight LLMs', 'Docker'],
    outcomes: [
      'Unstructured input handled without abandoning deterministic decisions',
      'Auditable decision logic separate from the model',
      'Confidence-based routing to human review',
      'Separate monitoring for extraction quality and decision volume',
    ],
    faq: [
      {
        question: 'Why not let the model make the decision too?',
        answer:
          'Because you need to be able to explain the decision, reproduce it, and change it without retraining anything. Keeping the decision in auditable rules means a policy change is a configuration change, and the same input always produces the same outcome.',
      },
    ],
    solutionSlugs: ['intelligent-ticket-triage', 'document-to-workflow', 'ai-document-processing'],
    caseStudySlugs: ['intelligent-ticket-triage-demo'],
    order: 7,
    seo: {
      description:
        'VASTRIX combines AI classification and extraction with deterministic rules, approvals and monitoring — intelligent automation for ticket triage, document-to-workflow and routing.',
    },
  },
];
