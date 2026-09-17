import type { Service } from '@vastrix/types';

/**
 * Product & SaaS Engineering (catalogue §6) and Consulting & Technology Advisory (catalogue §7).
 *
 * The catalogue gives these services a one-line definition each rather than the deliverable/
 * use-case lists used in §2–§5. Capabilities and use cases below are conservatively derived from
 * those definitions and from the engagement models in catalogue §9 and lifecycle in §10 — nothing
 * is introduced that the source material does not support.
 */
export const productSaasServices: Service[] = [
  {
    slug: 'saas-product-development',
    name: 'SaaS Product Development',
    categorySlug: 'product-saas-engineering',
    shortDescription:
      'Build cloud-based products from concept through MVP, production and iterative improvement.',
    heroTitle: 'Build it as a product, with the operational concerns that implies',
    heroDescription:
      'Cloud products taken from concept through MVP, production and iterative improvement — with tenancy, billing boundaries, access control and observability designed in rather than added under pressure.',
    problemStatement:
      'A SaaS product is not an application with a login page. Multi-tenancy, per-tenant data isolation, subscription state, usage limits and operational visibility all shape the data model. Retrofitting them into a working single-tenant application is one of the more expensive mistakes in software.',
    whatWeDo:
      'We decide the tenancy model, isolation boundary and access-control model before writing the schema, because these are the decisions that are costly to reverse. The product ships with the operational apparatus a service needs: health checks, structured logs, metrics, error tracking and a rehearsed deployment and rollback path.',
    capabilities: [
      'Product architecture and tenancy model',
      'Frontend and backend engineering',
      'Authentication, roles and permissions',
      'Subscription and usage boundaries',
      'Deployment, observability and release process',
    ],
    useCases: [
      'New cloud products',
      'Productising an internal system',
      'Client-owned SaaS platforms',
    ],
    technologyApproach:
      'Tenant isolation is enforced at the data-access layer rather than relying on every query being written correctly. Authorisation is checked server-side on every request. The stack is self-hostable end to end, so the product is not locked to one provider from day one.',
    technologies: [
      'Next.js',
      'TypeScript',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Docker',
      'Keycloak',
    ],
    outcomes: [
      'A tenancy and isolation model decided before the schema',
      'Authorisation enforced at the data-access boundary',
      'Operational visibility from first deployment',
      'A release and rollback process that has actually been rehearsed',
    ],
    faq: [
      {
        question: 'Who owns the intellectual property?',
        answer:
          'That is set out explicitly in the engagement terms before work starts. For client-owned products you own the code. Where we co-develop under a product partnership, commercial, ownership and support terms are agreed in writing up front rather than left to be worked out later.',
      },
    ],
    order: 1,
    seo: {
      description:
        'VASTRIX builds cloud-based SaaS products from concept through MVP, production and iterative improvement, with tenancy, access control and observability designed in.',
    },
  },
  {
    slug: 'mvp-development',
    name: 'MVP Development',
    categorySlug: 'product-saas-engineering',
    shortDescription:
      'Turn a validated idea into a working product for stakeholder or user validation.',
    heroTitle: 'The smallest thing that answers the question you are actually asking',
    heroDescription:
      'A working product that puts a specific assumption in front of real users or stakeholders — scoped to test that assumption rather than to be a smaller version of everything.',
    problemStatement:
      'Most MVPs are not minimum or viable. They are the full product with features removed, which takes almost as long to build and tests nothing in particular. Six months later the team has learned little more than it knew at the start.',
    whatWeDo:
      'We establish which assumption is riskiest and scope the build to test it. Everything else is deliberately deferred, and we write down what was deferred so it is a decision rather than an omission. The result is a working product, deployed and usable — not a prototype that cannot be put in front of a real user.',
    capabilities: [
      'Assumption and scope definition',
      'Rapid product design',
      'Working, deployed implementation',
      'Instrumentation for validation',
      'Post-validation roadmap',
    ],
    useCases: [
      'Stakeholder validation',
      'User validation before full investment',
      'Funding and approval demonstrations',
    ],
    technologyApproach:
      'We use the same production stack rather than throwaway tooling, so a successful MVP can be extended instead of rebuilt. Instrumentation is included from the start, because an MVP with no measurement produces opinions rather than evidence.',
    technologies: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    outcomes: [
      'A working, deployed product testing a specific assumption',
      'Deferred scope recorded as explicit decisions',
      'Instrumentation that produces evidence rather than opinions',
      'A codebase that can be extended rather than replaced',
    ],
    order: 2,
    seo: {
      description:
        'VASTRIX turns a validated idea into a working product for stakeholder or user validation — scoped to test the riskiest assumption, built on a production-ready stack.',
    },
  },
  {
    slug: 'ai-product-development',
    name: 'AI Product Development',
    categorySlug: 'product-saas-engineering',
    shortDescription:
      'Embed AI features into standalone products as part of the product architecture.',
    heroTitle: 'AI as part of the product architecture, not a feature bolted on',
    heroDescription:
      'Products where AI is one component among several — with cost, latency, evaluation and failure behaviour treated as product requirements rather than implementation details.',
    problemStatement:
      'AI features introduce properties most product architectures are not designed for: variable per-request cost, unpredictable latency, non-deterministic output and a quality level that changes when the model does. Added late, these turn into margin problems and support load.',
    whatWeDo:
      'We design the AI component with its operational characteristics in view: caching and batching where they reduce cost, streaming where latency is visible to the user, and defined behaviour when the model is slow, unavailable or low-confidence. Output quality is tracked continuously so a regression is detected rather than reported by customers.',
    capabilities: [
      'AI feature architecture within the product',
      'Model selection and integration',
      'Evaluation and quality monitoring',
      'Cost and latency management',
      'Guardrails and fallback behaviour',
    ],
    useCases: [
      'AI features in existing products',
      'AI-native product development',
      'Knowledge and assistant features',
    ],
    technologyApproach:
      'Model access sits behind an internal interface so a model can be swapped without touching product code. Per-request cost and latency are exported as metrics. Evaluation runs on a versioned test set in the pipeline, so a prompt or model change is a reviewable decision with measured consequences.',
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'pgvector',
      'Redis',
      'Open-weight LLMs',
      'Docker',
    ],
    outcomes: [
      'Model access isolated behind a swappable interface',
      'Per-request cost and latency visible in monitoring',
      'Quality regressions caught in the pipeline rather than by customers',
      'Defined behaviour when the model is unavailable or uncertain',
    ],
    order: 3,
    seo: {
      description:
        'VASTRIX embeds AI features into products as part of the architecture — model integration, evaluation, quality monitoring, cost and latency management and guardrails.',
    },
  },
  {
    slug: 'internal-tools-portals',
    name: 'Internal Tools & Portals',
    categorySlug: 'product-saas-engineering',
    shortDescription: 'Build secure, role-based operational tools for organizations.',
    heroTitle: 'Internal tools that deserve the same engineering as external ones',
    heroDescription:
      'Secure, role-based operational tools and portals — with the access control, audit trail and reliability that internal systems handling real data actually require.',
    problemStatement:
      'Internal tools are routinely built to a lower standard on the assumption that users are trusted. They then accumulate access to production data, personal information and privileged operations, with no audit trail and no meaningful authorisation model.',
    whatWeDo:
      'We apply the same standard we would to a customer-facing system: role-based access enforced server-side, an audit trail on privileged actions, and sensible handling of the personal data these tools inevitably touch. Internal does not mean unauthenticated, and trusted does not mean unlogged.',
    capabilities: [
      'Role-based access control',
      'Operational workflow interfaces',
      'Audit logging on privileged actions',
      'Integration with existing systems',
      'Deployment and handover',
    ],
    useCases: [
      'Operations and admin portals',
      'Back-office tooling',
      'Departmental workflow systems',
    ],
    technologyApproach:
      'Authorisation is enforced at the API layer, never by hiding interface elements. Privileged actions are written to an append-only audit log with actor, timestamp and affected record. Access to personal data is scoped to role and logged.',
    technologies: ['Next.js', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Keycloak', 'Docker'],
    outcomes: [
      'Server-side authorisation rather than hidden buttons',
      'An append-only audit trail on privileged actions',
      'Role-scoped access to personal data',
      'A tool your team can operate and extend',
    ],
    solutionSlugs: ['ai-enabled-internal-tools', 'custom-digital-portals'],
    order: 4,
    seo: {
      description:
        'VASTRIX builds secure, role-based operational tools and internal portals with server-side authorisation, audit logging and integration with existing systems.',
    },
  },
];

export const consultingServices: Service[] = [
  {
    slug: 'digital-transformation-consulting',
    name: 'Digital Transformation Consulting',
    categorySlug: 'consulting',
    shortDescription: 'Assess workflows, systems and opportunities for digitalization.',
    heroTitle: 'Assess what is worth digitalising before committing to a programme',
    heroDescription:
      'A grounded assessment of current workflows, systems and constraints, producing a prioritised view of where digitalisation will pay off — and where it will not.',
    problemStatement:
      'Transformation programmes are frequently defined by the technology they will adopt rather than the problems they will solve. The result is a multi-year plan that survives contact with the organisation for about a quarter.',
    whatWeDo:
      'We assess how work is actually done, where the friction is, and what constrains change — systems, data, skills, procurement and appetite. The output is a prioritised sequence that begins with something deliverable, rather than a target-state architecture with no route to it.',
    capabilities: [
      'Current-state workflow and systems assessment',
      'Constraint and dependency analysis',
      'Prioritised opportunity list',
      'Target architecture and sequencing',
      'Delivery roadmap',
    ],
    useCases: [
      'Programme definition',
      'Legacy system modernization planning',
      'Departmental digitalisation',
    ],
    technologyApproach:
      'Assessment is technology-neutral until the problems are understood. Recommendations are sequenced so each step delivers value on its own rather than depending on the whole programme completing.',
    technologies: ['Architecture documentation', 'Process mapping'],
    outcomes: [
      'An evidence-based view of current-state workflows and constraints',
      'A prioritised opportunity list with effort and dependency estimates',
      'A sequence where each step is independently valuable',
      'An explicit statement of what should not be pursued',
    ],
    order: 1,
    seo: {
      description:
        'VASTRIX assesses workflows, systems and opportunities for digitalization, producing a prioritised, sequenced roadmap grounded in real constraints.',
    },
  },
  {
    slug: 'automation-opportunity-assessment',
    name: 'Automation Opportunity Assessment',
    categorySlug: 'consulting',
    shortDescription: 'Identify high-value processes for automation and prioritize pilots.',
    heroTitle: 'Find the processes where automation actually pays',
    heroDescription:
      'A structured assessment of candidate processes against volume, variability, error cost and integration feasibility, producing a ranked shortlist and a recommended pilot.',
    problemStatement:
      'Automation candidates are usually nominated by whoever finds a process most annoying, which correlates poorly with where automation returns the most. High-variability processes get automated and fail; high-volume mechanical ones stay manual.',
    whatWeDo:
      'We assess each candidate against the factors that actually determine return: volume, variability, the cost of an error, how stable the process is, and whether an integration surface exists. Candidates are ranked, and we recommend a first pilot chosen for a demonstrable result rather than for scale.',
    capabilities: [
      'Process inventory and volume analysis',
      'Feasibility and integration assessment',
      'Effort and benefit estimation',
      'Ranked candidate shortlist',
      'Pilot definition',
    ],
    useCases: [
      'Automation programme planning',
      'Operations efficiency reviews',
      'Shared-services assessment',
    ],
    technologyApproach:
      'Assessment includes a technical feasibility check on each candidate — whether an API, database view or file export exists, or whether interface automation would be the only route, which materially changes the cost and durability of the result.',
    technologies: ['Process mapping', 'Integration assessment'],
    outcomes: [
      'A ranked shortlist with effort and benefit estimates',
      'Technical feasibility assessed per candidate, not assumed',
      'A defined first pilot chosen for a demonstrable result',
      'Candidates that should not be automated, and why',
    ],
    order: 2,
    seo: {
      description:
        'VASTRIX identifies high-value processes for automation and prioritises pilots, assessing volume, variability, error cost and integration feasibility.',
    },
  },
  {
    slug: 'ai-readiness-assessment',
    name: 'AI Readiness & Use-Case Assessment',
    categorySlug: 'consulting',
    shortDescription: 'Identify practical AI opportunities, data needs, feasibility and roadmap.',
    heroTitle: 'Establish whether your data can support the AI you have in mind',
    heroDescription:
      'An assessment of candidate AI use cases against data availability and quality, feasibility, governance requirements and the decision each would actually support.',
    problemStatement:
      'AI initiatives usually fail on data rather than models. The data exists but is incomplete, inconsistently labelled, or describes a process that has since changed. That is discoverable in weeks, but is often discovered after months of build.',
    whatWeDo:
      'We examine the actual data behind each candidate use case — availability, quality, labelling, history, and whether it represents the current process. We assess governance and access constraints alongside it, since these frequently decide whether a use case is viable at all. The output separates what is feasible now from what needs data work first.',
    capabilities: [
      'Use-case identification and scoping',
      'Data availability and quality assessment',
      'Feasibility and governance review',
      'Proof-of-concept definition',
      'Prioritised roadmap',
    ],
    useCases: ['AI strategy definition', 'Pre-investment feasibility', 'Data readiness review'],
    technologyApproach:
      'Where feasibility is genuinely uncertain, we scope a proof of concept to answer one question — usually whether the available data supports the task — rather than building a partial product that answers nothing conclusively.',
    technologies: ['Python', 'Data profiling', 'Evaluation frameworks'],
    outcomes: [
      'Use cases separated into feasible now, feasible after data work, and not feasible',
      'A data-quality assessment behind each judgement',
      'Governance and access constraints identified early',
      'A prioritised roadmap with a defined first step',
    ],
    faq: [
      {
        question: 'How long does an assessment take?',
        answer:
          'It depends on the number of candidate use cases and how accessible the underlying data is. We scope it explicitly before starting, with a defined set of deliverables, so it does not become an open-ended engagement.',
      },
    ],
    order: 3,
    seo: {
      description:
        'VASTRIX identifies practical AI opportunities and assesses data needs, feasibility and governance, producing a prioritised roadmap and proof-of-concept definition.',
    },
  },
  {
    slug: 'solution-architecture',
    name: 'Solution Architecture',
    categorySlug: 'consulting',
    shortDescription:
      'Translate requirements into scalable architecture, integrations and deployment design.',
    heroTitle: 'Architecture with its trade-offs written down',
    heroDescription:
      'Requirements translated into a documented architecture covering components, integrations, data flow, security boundaries and deployment — with the reasoning behind each significant decision recorded.',
    problemStatement:
      'Architecture decisions get made implicitly, by whoever wrote the first module. Two years later nobody knows why the system is shaped as it is, which makes every change either riskier or more conservative than it needs to be.',
    whatWeDo:
      'We produce an architecture that addresses the actual requirements — including the non-functional ones people forget to state, like recovery time, data retention and who may see what. Significant decisions are recorded as architecture decision records with the alternatives considered and the reason for the choice.',
    capabilities: [
      'Requirements and constraint analysis',
      'Component and integration architecture',
      'Data model and flow design',
      'Security and access-control design',
      'Deployment topology and architecture decision records',
    ],
    useCases: [
      'New system design',
      'Modernization planning',
      'Integration architecture',
      'Pre-procurement technical definition',
    ],
    technologyApproach:
      'We favour the simplest topology that meets the stated requirements, and document the conditions that would justify moving to something more complex. That gives you a defensible reason to scale up later and a defensible reason not to yet.',
    technologies: ['Architecture decision records', 'Docker', 'PostgreSQL', 'Nginx'],
    outcomes: [
      'A documented architecture covering components, data flow and security boundaries',
      'Non-functional requirements made explicit',
      'Decision records capturing alternatives and reasoning',
      'Defined triggers for when to scale the architecture up',
    ],
    order: 4,
    seo: {
      description:
        'VASTRIX translates requirements into scalable architecture, integrations and deployment design, with architecture decision records capturing the reasoning.',
    },
  },
];
