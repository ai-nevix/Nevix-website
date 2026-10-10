/**
 * About page content — specification §6, instruction §25.
 *
 * Content governance: no biographies, founding dates, headcount, revenue, funding, client counts
 * or milestones appear here. None were supplied, and instruction §25 forbids inventing them.
 */

export const about = {
  hero: {
    eyebrow: 'About VASTRIX',
    title: 'An intelligent technology and engineering company',
    description:
      'VASTRIX builds intelligent technology solutions across AI, automation, digital engineering and data. We help organizations simplify complex processes, connect systems, turn data into insight and build scalable digital products.',
  },

  /**
   * DUMMY-DATA: DD-009
   * Positioning narrative derived from the catalogue. Deliberately contains no dates, funding,
   * headcount, milestones or founder details — none were supplied. Replace with an approved
   * founding story.
   */
  story: {
    title: 'How we work, and why',
    paragraphs: [
      'VASTRIX was formed around a straightforward observation: most organisations do not have a technology problem, they have a problem that technology could solve — and the gap between those two statements is where budgets disappear.',
      'So we start with the problem. Before selecting a model, a framework or a platform, we establish what decision is being made, what the cost of getting it wrong actually is, and whether the available data and systems can support a better answer. Sometimes the conclusion is that a well-designed rule-based workflow beats a model. We would rather say that in an assessment than discover it after a build.',
      'The second commitment is that what we deliver should outlive the engagement. Architecture decisions are recorded with their reasoning. Deployment is reproducible. Handover is verified by your team running the system from documentation, not asserted by ours. Software you cannot maintain is a liability with a nice interface.',
    ],
  },

  vision: {
    title: 'Vision',
    body: 'Intelligent technology for a smarter tomorrow — systems that extend what people and organisations can do, rather than systems that merely replace steps.',
  },

  mission: {
    title: 'Mission',
    body: 'To combine problem discovery, engineering and automation into practical solutions that improve efficiency, enable better decisions and support long-term digital evolution.',
  },

  /** Derived from catalogue §11 engineering principles and §10 lifecycle. */
  values: [
    {
      title: 'Understand before building',
      description:
        'Technology follows a clearly understood problem. If the problem is not clear, more engineering will not help.',
    },
    {
      title: 'Say what is true',
      description:
        'We report measured performance, not projected performance. We do not guarantee accuracy, ROI or full automation, and we will tell you when something is not worth doing.',
    },
    {
      title: 'Build for the next maintainer',
      description:
        'Documentation, decision records and reproducible environments, because someone will need to change this without us.',
    },
    {
      title: 'Keep people in the loop where it matters',
      description:
        'Automated decisions that affect people keep human oversight. That is a design position, not a limitation.',
    },
    {
      title: 'Prefer the simplest thing that works',
      description:
        'Complexity is a cost paid daily. We introduce it when a requirement justifies it, and document what would justify more.',
    },
    {
      title: 'Stay portable',
      description:
        'An open-source, self-hostable stack by default, so you are not locked to a platform decision made on day one.',
    },
  ],

  /** Catalogue §11, verbatim principle names. */
  principles: [
    {
      title: 'Problem-first engineering',
      description: 'Technology follows a clearly understood problem.',
    },
    {
      title: 'Security and access control',
      description:
        'Especially important for enterprise and public-sector workflows. Authorisation is enforced server-side, privileged actions are logged, and least privilege is the default.',
    },
    {
      title: 'Scalability',
      description:
        'Solutions should be able to grow with users, data and integrations — without being over-built on day one.',
    },
    {
      title: 'Observability',
      description:
        'Logs, status, errors and operational visibility are considered early, not added after the first incident.',
    },
    {
      title: 'Maintainability',
      description: 'Clean architecture, documentation and reusable components.',
    },
    {
      title: 'Human-in-the-loop where appropriate',
      description: 'AI supports people when oversight is required.',
    },
    {
      title: 'Measurable outcomes',
      description:
        'Success is defined using relevant KPIs such as time saved, errors reduced, throughput or response time — agreed before the work starts.',
    },
  ],

  /** Catalogue §10 — the standard project lifecycle. */
  lifecycle: [
    {
      step: 'Discover',
      description: 'Understand users, process, constraints and success criteria.',
    },
    {
      step: 'Define',
      description: 'Requirements, scope, architecture and measurable outcomes.',
    },
    {
      step: 'Prototype',
      description: 'Validate uncertain ideas through a prototype or proof of concept.',
    },
    { step: 'Build', description: 'Develop, integrate and test.' },
    { step: 'Deploy', description: 'Release with documentation and handover.' },
    { step: 'Evolve', description: 'Monitor, maintain, optimize and enhance.' },
  ],

  /** Catalogue §9 — engagement models. */
  engagementModels: [
    {
      title: 'Project-Based Development',
      description: 'Defined scope, milestones and delivery.',
    },
    {
      title: 'Discovery → Proof of Concept → Scale',
      description: 'Validate feasibility and value before full implementation.',
    },
    {
      title: 'Dedicated Engineering Team',
      description: 'A focused team for a longer product or transformation initiative.',
    },
    {
      title: 'Managed Automation / Support',
      description: 'Ongoing monitoring, maintenance and enhancements.',
    },
    {
      title: 'SaaS / Product Partnership',
      description:
        'Co-development with explicit commercial, ownership and support terms agreed in writing.',
    },
  ],

  /**
   * Technology capabilities. Catalogue §16 explicitly forbids long technology lists used to make
   * the company appear larger, so this is limited to what the stack actually uses.
   */
  capabilities: [
    {
      area: 'Frontend',
      items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Radix UI'],
    },
    {
      area: 'Backend',
      items: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy'],
    },
    {
      area: 'Data',
      items: ['PostgreSQL', 'pandas', 'SQL', 'pgvector'],
    },
    {
      area: 'AI',
      items: ['Open-weight LLMs', 'Retrieval-augmented generation', 'scikit-learn', 'OpenCV'],
    },
    {
      area: 'Automation',
      items: ['Celery', 'Redis', 'Ansible', 'Playwright'],
    },
    {
      area: 'Operations',
      items: ['Docker', 'Nginx', 'Prometheus', 'Grafana', 'Loki', 'GitLab CI'],
    },
  ],
} as const;

/**
 * The team.
 *
 * DUMMY-DATA: DD-003
 * The two founders below are real and approved. What is still missing is everyone else: no cards
 * or biographies have been supplied for the wider team, so the page says so rather than padding
 * the list. The marker stays until those are supplied — a page that shows two people is accurate,
 * but it is not yet the whole team.
 *
 * Every field is taken verbatim from the supplied cards in `brand-assets/` — the name, the role
 * and the quote each person is credited with. Nothing else was supplied, so nothing else is
 * stated: no biography, no career history, no qualifications, no tenure, no prior employers.
 * Instruction §25 forbids inventing any of it, and a profile that says less is not a placeholder
 * — it is simply the part that has been approved.
 *
 * The cards are published whole rather than cropped, so each arrives as it was designed. That
 * puts the name, role and quote into the picture rather than into the page, so the fields below
 * carry them for everything that cannot see an image: the alternative text, a visually hidden
 * caption and the `Person` structured data all come from here.
 */
export interface TeamMember {
  /** URL-safe identifier, used for the anchor on the team page. */
  slug: string;
  name: string;
  role: string;
  /** Attributed to this person on the supplied card. */
  quote: string;
  /** The supplied card, published whole. Square. */
  card: string;
}

/**
 * Describes a card for anyone who cannot see it.
 *
 * Derived rather than written out per person, so the alternative text cannot drift from the role
 * and quote it is describing — an earlier hand-written version already said "Founder and CEO"
 * where the role said "Founder & CEO".
 */
export function teamCardAlt(member: TeamMember): string {
  return `${member.name}, ${member.role} of VASTRIX, with the quote “${member.quote}”`;
}

export const team: readonly TeamMember[] = [
  {
    slug: 'jyoti-rokade',
    name: 'Jyoti Rokade',
    role: 'Founder & CEO',
    quote: 'Technology creates opportunities. People give them meaning.',
    card: '/team/jyoti-rokade.webp',
  },
  {
    slug: 'vaidehi-bhagane',
    name: 'Vaidehi Bhagane',
    role: 'Co-Founder',
    quote: 'Ideas grow brighter when we build them together.',
    card: '/team/vaidehi-bhagane.webp',
  },
] as const;
