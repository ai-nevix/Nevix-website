import type { ServiceCategory } from '@nevix/types';

/**
 * The six service categories.
 *
 * Slugs are fixed by specification §5.1. `positioning` and `oneLineValue` / `cardCta` are taken
 * verbatim from catalogue §1 and §13 — do not reword them without content-owner approval.
 */
export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'ai-intelligence',
    name: 'AI & Intelligence',
    navLabel: 'AI & Intelligence',
    positioning:
      'Build intelligent systems that understand, predict, generate, classify and assist.',
    oneLineValue: 'Build AI systems that understand, generate, predict and assist.',
    cardCta: 'Explore AI',
    description:
      "NEVIX's primary differentiator: combining AI with real business and operational problems. We work from a clearly understood problem towards a system that can be evaluated, deployed and maintained — not towards a demo.",
    heroTitle: 'AI applied to real operational problems',
    heroDescription:
      'Generative AI, agents, machine learning, language, vision and document intelligence — designed around a defined problem, evaluated against it, and built to run in production with human oversight where it matters.',
    icon: 'brain',
    isCorePillar: true,
    order: 1,
    seo: {
      title: 'AI & Intelligence Services',
      description:
        'NEVIX builds intelligent systems that understand, predict, generate, classify and assist — generative AI, AI agents, machine learning, NLP, computer vision and document intelligence.',
    },
  },
  {
    slug: 'automation',
    name: 'Automation',
    navLabel: 'Automation',
    positioning:
      'Turn repetitive, rule-based and multi-step work into reliable automated workflows.',
    oneLineValue: 'Eliminate repetitive work and connect workflows and systems.',
    cardCta: 'Automate Work',
    description:
      'Remove repetitive work, connect systems and create repeatable operational workflows. Automation at NEVIX starts with process discovery, because automating a badly understood process only makes it fail faster.',
    heroTitle: 'Automation that holds up under real operating conditions',
    heroDescription:
      'Process automation, Python automation, workflow orchestration, RPA, API integration and infrastructure automation — with exception handling, notifications and operational logging designed in from the start.',
    icon: 'settings',
    isCorePillar: true,
    order: 2,
    seo: {
      title: 'Automation Services',
      description:
        'NEVIX turns repetitive, rule-based and multi-step work into reliable automated workflows — business process automation, Python automation, RPA, API orchestration and infrastructure automation.',
    },
  },
  {
    slug: 'digital-engineering',
    name: 'Digital Engineering',
    navLabel: 'Digital Engineering',
    positioning:
      'Design and build modern websites, applications, APIs, software systems and user experiences.',
    oneLineValue: 'Design and build modern websites, applications, APIs and platforms.',
    cardCta: 'Build Digital',
    description:
      'The execution layer: websites, applications, APIs and software platforms. This is where a defined problem becomes running software with tests, documentation and a deployment path.',
    heroTitle: 'The execution layer — software that ships and keeps running',
    heroDescription:
      'Websites, web and business applications, backend services and APIs, interface design, custom software and the cloud and DevOps engineering that keeps all of it deployable.',
    icon: 'code',
    isCorePillar: true,
    order: 3,
    seo: {
      title: 'Digital Engineering Services',
      description:
        'NEVIX designs and builds modern websites, web applications, APIs, custom software and user experiences, with cloud and DevOps engineering for reliable delivery.',
    },
  },
  {
    slug: 'data-analytics',
    name: 'Data & Analytics',
    navLabel: 'Data & Analytics',
    positioning: 'Turn raw data into reporting, insight, prediction and decision support.',
    oneLineValue: 'Turn data into insights, dashboards, predictions and decisions.',
    cardCta: 'Unlock Data',
    description:
      'Move organizations from raw information to actionable insight and, where appropriate, prediction. We treat the pipeline, the model and the dashboard as one system, because a dashboard is only as trustworthy as the data feeding it.',
    heroTitle: 'From raw data to decisions people actually act on',
    heroDescription:
      'Analytics, business intelligence, data engineering and ETL, predictive modelling, reporting automation and decision intelligence — built on validated pipelines rather than one-off extracts.',
    icon: 'chart',
    isCorePillar: true,
    order: 4,
    seo: {
      title: 'Data & Analytics Services',
      description:
        'NEVIX turns raw data into reporting, insight, prediction and decision support — analytics, BI dashboards, data engineering and ETL, predictive analytics and reporting automation.',
    },
  },
  {
    slug: 'product-saas-engineering',
    name: 'Product & SaaS Engineering',
    navLabel: 'Product & SaaS',
    positioning:
      'Extend engineering capability into NEVIX-owned and client-owned software products.',
    oneLineValue: 'Take a product from validated idea to running SaaS.',
    cardCta: 'Build a Product',
    description:
      'NEVIX can extend its engineering capability into its own SaaS products and client-owned products. This is presented as a capability and a product-development practice, covering concept through MVP, production and iterative improvement.',
    heroTitle: 'Product engineering, from validated idea to running service',
    heroDescription:
      'SaaS product development, MVPs for stakeholder validation, AI-enabled products and secure role-based internal tools — engineered as products, with the operational concerns that implies.',
    icon: 'package',
    isCorePillar: false,
    order: 5,
    seo: {
      title: 'Product & SaaS Engineering',
      description:
        'NEVIX builds cloud products from concept through MVP, production and iterative improvement — SaaS product development, MVP development, AI product development and internal tools.',
    },
  },
  {
    slug: 'consulting',
    name: 'Consulting & Technology Advisory',
    navLabel: 'Consulting',
    positioning: 'Assess workflows, systems and opportunities before committing to a build.',
    oneLineValue: 'Find out what is worth building before you build it.',
    cardCta: 'Get an Assessment',
    description:
      'Advisory work that reduces the risk of building the wrong thing. Assessments produce a prioritised, evidence-based view of where digitalisation, automation or AI will actually pay off — and where it will not.',
    heroTitle: 'Decide what to build before committing budget to it',
    heroDescription:
      'Digital transformation consulting, automation opportunity assessment, AI readiness and use-case assessment, and solution architecture — each producing a concrete, prioritised roadmap.',
    icon: 'compass',
    isCorePillar: false,
    order: 6,
    seo: {
      title: 'Consulting & Technology Advisory',
      description:
        'NEVIX assesses workflows, systems and opportunities for digitalisation, automation and AI — producing feasibility findings, solution architecture and a prioritised roadmap.',
    },
  },
];

export const serviceCategoryBySlug = new Map(serviceCategories.map((c) => [c.slug, c]));

/** The four core pillars, in the order used on the homepage. */
export const corePillars = serviceCategories.filter((c) => c.isCorePillar);
