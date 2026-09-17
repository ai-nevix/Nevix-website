import type { Service } from '@vastrix/types';

/**
 * Digital Engineering services — catalogue §4.
 *
 * `capabilities` and `useCases` reproduce the catalogue's "Typical deliverables" and
 * "Typical use cases" verbatim.
 */
export const digitalEngineeringServices: Service[] = [
  {
    slug: 'website-development',
    name: 'Website Development',
    categorySlug: 'digital-engineering',
    shortDescription: 'Modern responsive corporate, product, portal and campaign websites.',
    heroTitle: 'Websites that are fast, accessible and editable without a developer',
    heroDescription:
      'Frontend development, forms and integrations, a CMS where it is required, an SEO-ready foundation and deployment — built so routine content changes never need a release.',
    problemStatement:
      'Corporate websites decay predictably. Content becomes stale because publishing requires a developer, performance degrades as scripts accumulate, and accessibility is treated as a post-launch audit rather than a build constraint.',
    whatWeDo:
      'We build server-rendered sites that ship minimal JavaScript, put editable content behind a CMS so the marketing team is not blocked on engineering, and treat accessibility and Core Web Vitals as build-time requirements rather than things to fix later. Structured data, sitemaps and canonical URLs are part of the foundation.',
    capabilities: [
      'Frontend development',
      'Forms and integrations',
      'CMS where required',
      'SEO-ready foundation',
      'Deployment',
    ],
    useCases: ['Corporate sites', 'Organization portals', 'Landing pages', 'Campaign sites'],
    technologyApproach:
      'Next.js with server components by default, so interactivity is opted into rather than assumed. Content lives in a self-hosted CMS with a typed integration layer. Images are optimised and served in modern formats. The whole thing deploys as a container behind Nginx.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Strapi', 'Docker', 'Nginx'],
    outcomes: [
      'Content editable by non-developers without a deployment',
      'Server-rendered pages with minimal client-side JavaScript',
      'WCAG 2.2 AA principles applied during the build, not audited afterwards',
      'SEO foundation: metadata, sitemap, canonicals and structured data',
    ],
    faq: [
      {
        question: 'Can our team edit the site ourselves?',
        answer:
          'Yes. Content that changes routinely is managed in a self-hosted CMS with role-based access, so editors publish without involving engineering and without a deployment.',
      },
      {
        question: 'Do we have to use a hosted platform?',
        answer:
          'No. Our default stack is entirely open source and self-hostable — you can run it on your own infrastructure. This website is built on exactly that stack.',
      },
    ],
    solutionSlugs: ['custom-digital-portals'],
    order: 1,
    seo: {
      description:
        'VASTRIX builds modern responsive corporate, product, portal and campaign websites with frontend development, CMS integration, an SEO-ready foundation and deployment.',
    },
  },
  {
    slug: 'web-application-development',
    name: 'Web Application Development',
    categorySlug: 'digital-engineering',
    shortDescription: 'Browser-based applications built around specific workflows.',
    heroTitle: 'Applications built around how the work is actually done',
    heroDescription:
      'Frontend, backend, authentication, databases, role-based access control, testing and deployment — for admin portals, operations platforms, internal tools and customer portals.',
    problemStatement:
      'Internal applications are often shaped by the database schema rather than by the job people are doing. Users end up navigating someone else’s data model, and the application becomes something to be worked around rather than used.',
    whatWeDo:
      'We model the workflow first and design the interface around the decisions people need to make, then build the data model that supports it. Authentication, roles and permissions are part of the architecture from the start, because retrofitting authorisation into a working application is how access-control bugs get introduced.',
    capabilities: [
      'Frontend',
      'Backend',
      'Authentication',
      'Databases',
      'RBAC',
      'Testing and deployment',
    ],
    useCases: ['Admin portals', 'Operations platforms', 'Internal tools', 'Customer portals'],
    technologyApproach:
      'A typed contract between frontend and backend so a breaking API change is a compile error rather than a production incident. Authorisation is enforced server-side on every request — never by hiding a button. Schema changes go through migrations. Critical paths are covered by tests before release.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    outcomes: [
      'An interface organised around the task rather than the schema',
      'Authorisation enforced server-side on every request',
      'Schema changes managed through reviewed migrations',
      'Test coverage on the paths where failure is expensive',
    ],
    solutionSlugs: ['custom-digital-portals', 'ai-enabled-internal-tools'],
    order: 2,
    seo: {
      description:
        'VASTRIX builds browser-based applications around specific workflows — frontend, backend, authentication, databases, RBAC, testing and deployment.',
    },
  },
  {
    slug: 'application-development',
    name: 'Application Development',
    categorySlug: 'digital-engineering',
    shortDescription: 'Custom software applications tailored to organizational requirements.',
    heroTitle: 'Software shaped to the organisation rather than the other way round',
    heroDescription:
      'Architecture, frontend and backend, integrations, testing and deployment — for business applications, workflow platforms and custom internal software.',
    problemStatement:
      'Off-the-shelf products force a choice between changing how the organisation works and paying for customisation that breaks at every upgrade. Neither is attractive when the process in question is the thing the organisation is good at.',
    whatWeDo:
      'We build applications around the requirements that genuinely differ, and integrate with existing systems for everything that does not. The aim is the smallest custom surface that solves the problem, because every line of custom code is something you will maintain.',
    capabilities: ['Architecture', 'Frontend and backend', 'Integrations', 'Testing', 'Deployment'],
    useCases: ['Business applications', 'Workflow platforms', 'Custom internal software'],
    technologyApproach:
      'Clear separation between interface, business logic and data access, so each can be changed without disturbing the others. Integrations sit behind an interface so a vendor change does not ripple through the application. Deployment is containerised and reproducible.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'TypeScript', 'React', 'Docker'],
    outcomes: [
      'Custom code limited to what is genuinely differentiating',
      'Integrations isolated behind a stable interface',
      'A reproducible deployment path',
      'Documentation and handover that let your team take ownership',
    ],
    order: 3,
    seo: {
      description:
        'VASTRIX builds custom software applications tailored to organizational requirements — architecture, frontend and backend, integrations, testing and deployment.',
    },
  },
  {
    slug: 'backend-api-development',
    name: 'Backend & API Development',
    categorySlug: 'digital-engineering',
    shortDescription:
      'Reliable backend services and APIs powering web, mobile and AI applications.',
    heroTitle: 'APIs with a contract, a version and a failure mode',
    heroDescription:
      'API design, Python services, business logic, database integration, authentication and documentation — for microservices, AI inference APIs, mobile backends and system integrations.',
    problemStatement:
      'An API without a versioned contract becomes an obligation to never change anything. Consumers depend on undocumented behaviour, error responses are inconsistent, and every change risks breaking a client nobody remembers exists.',
    whatWeDo:
      'We design the contract first, version it from day one, and validate every request and response against it. Error responses follow one consistent shape so clients can handle failure generically. Documentation is generated from the schema, so it cannot drift from the implementation.',
    capabilities: [
      'API design',
      'Python services',
      'Business logic',
      'Database integration',
      'Authentication',
      'Documentation',
    ],
    useCases: ['Microservices', 'AI inference APIs', 'Mobile backends', 'System integrations'],
    technologyApproach:
      'FastAPI with Pydantic schemas gives request validation, response serialisation and OpenAPI documentation from one definition. Business logic sits in a service layer, database access in a repository layer, and route handlers stay thin. Public endpoints are rate limited. Health and readiness endpoints are exposed for orchestration.',
    technologies: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy', 'PostgreSQL', 'Redis', 'Docker'],
    outcomes: [
      'A versioned, validated API contract with generated documentation',
      'One consistent error shape across every endpoint',
      'Thin route handlers with testable business logic behind them',
      'Rate limiting and health checks on public surfaces',
    ],
    order: 4,
    seo: {
      description:
        'VASTRIX builds reliable backend services and APIs for web, mobile and AI applications — API design, Python services, database integration, authentication and documentation.',
    },
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    categorySlug: 'digital-engineering',
    shortDescription: 'User experiences that make complex software easier to understand and use.',
    heroTitle: 'Design that reduces the effort of doing the work',
    heroDescription:
      'User journeys, wireframes, high-fidelity UI, design systems and developer handoff — for enterprise applications, government portals, SaaS products and mobile and web apps.',
    problemStatement:
      'Complex software tends to expose its complexity. Users are asked to understand the system’s structure before they can complete a task, and training exists to compensate for an interface that never made the task clear.',
    whatWeDo:
      'We map the real user journeys, including the awkward paths and error states that get skipped in design reviews, and design around the decision the user is trying to make. Accessibility is a design constraint: contrast, focus order, target size and keyboard operability are decided at design time, not patched afterwards.',
    capabilities: [
      'User journeys',
      'Wireframes',
      'High-fidelity UI',
      'Design systems',
      'Developer handoff',
    ],
    useCases: [
      'Enterprise applications',
      'Government portals',
      'SaaS products',
      'Mobile and web apps',
    ],
    technologyApproach:
      'Design systems are delivered as tokens and components that map directly onto the implementation, so the built product matches the design without a reconciliation phase. Error, empty and loading states are designed explicitly rather than improvised during the build.',
    technologies: ['Design systems', 'Tailwind CSS', 'Radix UI', 'WCAG 2.2 AA'],
    outcomes: [
      'Journeys designed around user decisions, including failure paths',
      'Accessibility decided at design time',
      'A token and component system the implementation can follow exactly',
      'Empty, loading and error states specified rather than improvised',
    ],
    faq: [
      {
        question: 'Do you design for accessibility by default?',
        answer:
          'Yes. We target WCAG 2.2 AA principles as a design constraint — contrast, focus order, target sizes, keyboard operability and no information conveyed by colour alone. It is substantially cheaper than remediating after launch, and for public-sector work it is usually mandatory.',
      },
    ],
    order: 5,
    seo: {
      description:
        'VASTRIX designs user experiences that make complex software easier to use — user journeys, wireframes, high-fidelity UI, design systems and developer handoff.',
    },
  },
  {
    slug: 'custom-software-development',
    name: 'Custom Software Development',
    categorySlug: 'digital-engineering',
    shortDescription:
      'End-to-end engineering for software that does not fit off-the-shelf products.',
    heroTitle: 'End-to-end delivery, including the handover',
    heroDescription:
      'Requirements, architecture, build, testing, deployment and handover — for internal platforms, operational systems, custom portals and modernization work.',
    problemStatement:
      'Custom software projects fail at the edges: requirements that were never written down, a deployment only the original team understands, and a handover that consists of a repository link. The software works and nobody can maintain it.',
    whatWeDo:
      'We treat requirements, deployment and handover as deliverables in their own right. Architecture decisions are recorded with their reasoning so a future maintainer knows why, not just what. Handover includes runbooks, an environment guide and a working local setup — verified by someone from your team actually running it.',
    capabilities: ['Requirements', 'Architecture', 'Build', 'Testing', 'Deployment', 'Handover'],
    useCases: ['Internal platforms', 'Operational systems', 'Custom portals', 'Modernization'],
    technologyApproach:
      'Architecture decision records capture why each significant choice was made. Deployment is containerised so environments are reproducible. Handover is validated by your team running the system from documentation alone, before the engagement closes.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'TypeScript', 'Next.js', 'Docker', 'Nginx'],
    outcomes: [
      'Architecture decisions recorded with their reasoning',
      'A reproducible environment your team can stand up independently',
      'Runbooks covering deployment, rollback and routine operations',
      'Handover verified by your team, not asserted by ours',
    ],
    order: 6,
    seo: {
      description:
        'VASTRIX delivers end-to-end custom software engineering — requirements, architecture, build, testing, deployment and verified handover.',
    },
  },
  {
    slug: 'cloud-devops-engineering',
    name: 'Cloud & DevOps Engineering',
    categorySlug: 'digital-engineering',
    shortDescription: 'Support deployment, environment automation and reliable software delivery.',
    heroTitle: 'Deployments that are boring, repeatable and reversible',
    heroDescription:
      'Containerization, CI/CD, cloud deployment, infrastructure automation and operational practices — so releasing is a routine event rather than an operation requiring a calendar entry.',
    problemStatement:
      'When deployment is manual it becomes rare, and when it becomes rare each release carries more change and more risk. Teams end up batching work into large, frightening releases and rolling back by hand under pressure.',
    whatWeDo:
      'We containerise the application so the runtime is identical everywhere, build a pipeline that lints, type-checks, tests and builds on every change, and make rollback a documented, rehearsed procedure rather than an improvisation. We deliberately start with the simplest topology that meets the requirement.',
    capabilities: [
      'Containerization',
      'CI/CD',
      'Cloud deployment',
      'Infrastructure automation',
      'Operational practices',
    ],
    useCases: [
      'Cloud deployment',
      'Application releases',
      'Environment management',
      'Automated delivery',
    ],
    technologyApproach:
      'Docker Compose on a single host is the right answer more often than people expect; we introduce orchestration when scale, isolation or operational requirements justify it, not for appearance. Production deployment requires explicit approval in the pipeline. Health checks, structured logs and metrics are part of the deployment, not a later phase.',
    technologies: [
      'Docker',
      'Docker Compose',
      'Nginx',
      'GitLab CI',
      'Ansible',
      'Prometheus',
      'Grafana',
      'Loki',
    ],
    outcomes: [
      'Identical runtime across local, staging and production',
      'Every change linted, type-checked, tested and built before merge',
      'A rehearsed rollback procedure',
      'Health checks, metrics and logs available from day one',
    ],
    faq: [
      {
        question: 'Do we need Kubernetes?',
        answer:
          'Most likely not, at least not initially. A single Linux host running Docker Compose handles a great deal of traffic and is far cheaper to operate. We move to orchestration when scale, isolation or operational requirements justify it — introducing it for appearance is a cost you pay every day afterwards.',
      },
    ],
    solutionSlugs: ['infrastructure-automation'],
    order: 7,
    seo: {
      description:
        'VASTRIX supports deployment, environment automation and reliable software delivery with containerization, CI/CD, cloud deployment and infrastructure automation.',
    },
  },
];
