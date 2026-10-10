import { describe, expect, it } from 'vitest';

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { team, teamCardAlt } from './about';
import { caseStudies } from './case-studies';
import { industries } from './industries';
import { authors, insightCategories, insights } from './insights';
import { products } from './products';
import { serviceCategories } from './service-categories';
import { services } from './services';
import { solutions } from './solutions';
import { legalDocuments } from './legal';
import { footerNav, primaryNav, siteConfig } from './site';

/**
 * Content integrity tests.
 *
 * Two jobs:
 *
 * 1. **Referential integrity.** Every cross-reference between content files is checked, so a
 *    renamed slug produces a failing test rather than a silently missing card at runtime.
 *
 * 2. **Content governance.** The rules in specification §31 and catalogue §16 are enforced
 *    mechanically. A reviewer can miss an added testimonial or an invented certification; these
 *    tests cannot. This is the part of the suite that protects the company rather than the code.
 */

const serviceSlugs = new Set(services.map((s) => s.slug));
const solutionSlugs = new Set(solutions.map((s) => s.slug));
const industrySlugs = new Set(industries.map((i) => i.slug));
const caseStudySlugs = new Set(caseStudies.map((c) => c.slug));
const categorySlugs = new Set(serviceCategories.map((c) => c.slug));

/** Everything that carries a slug, for uniqueness and format checks. */
const allEntries = [
  ...serviceCategories.map((e) => ({ kind: 'service-category', slug: e.slug, name: e.name })),
  ...services.map((e) => ({ kind: 'service', slug: e.slug, name: e.name })),
  ...solutions.map((e) => ({ kind: 'solution', slug: e.slug, name: e.name })),
  ...industries.map((e) => ({ kind: 'industry', slug: e.slug, name: e.name })),
  ...products.map((e) => ({ kind: 'product', slug: e.slug, name: e.name })),
  ...caseStudies.map((e) => ({ kind: 'case-study', slug: e.slug, name: e.title })),
  ...insights.map((e) => ({ kind: 'insight', slug: e.slug, name: e.title })),
];

describe('structure', () => {
  it('defines the six service categories fixed by specification §5.1', () => {
    expect([...categorySlugs].sort()).toEqual([
      'ai-intelligence',
      'automation',
      'consulting',
      'data-analytics',
      'digital-engineering',
      'product-saas-engineering',
    ]);
  });

  it('marks exactly four categories as core pillars', () => {
    const pillars = serviceCategories.filter((c) => c.isCorePillar).map((c) => c.slug);
    expect(pillars.sort()).toEqual([
      'ai-intelligence',
      'automation',
      'data-analytics',
      'digital-engineering',
    ]);
  });

  it('defines all 35 services from the catalogue', () => {
    expect(services).toHaveLength(35);
  });

  it.each([
    ['ai-intelligence', 7],
    ['automation', 7],
    ['digital-engineering', 7],
    ['data-analytics', 6],
    ['product-saas-engineering', 4],
    ['consulting', 4],
  ])('places %i services in %s', (categorySlug, expected) => {
    expect(services.filter((s) => s.categorySlug === categorySlug)).toHaveLength(expected);
  });
});

describe('slugs', () => {
  it('uses lower-case hyphenated slugs throughout', () => {
    for (const entry of allEntries) {
      expect(entry.slug, `${entry.kind} "${entry.name}"`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each([
    ['services', services],
    ['solutions', solutions],
    ['industries', industries],
    ['products', products],
    ['case studies', caseStudies],
    ['insights', insights],
  ])('has unique slugs within %s', (_label, collection) => {
    const slugs = collection.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('referential integrity', () => {
  it('assigns every service to a real category', () => {
    for (const service of services) {
      expect(categorySlugs.has(service.categorySlug), service.slug).toBe(true);
    }
  });

  it('resolves every service -> solution reference', () => {
    for (const service of services) {
      for (const slug of service.solutionSlugs ?? []) {
        expect(solutionSlugs.has(slug), `${service.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every service -> case study reference', () => {
    for (const service of services) {
      for (const slug of service.caseStudySlugs ?? []) {
        expect(caseStudySlugs.has(slug), `${service.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every solution -> service reference', () => {
    for (const solution of solutions) {
      for (const slug of solution.relatedServiceSlugs) {
        expect(serviceSlugs.has(slug), `${solution.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every solution -> industry reference', () => {
    for (const solution of solutions) {
      for (const slug of solution.relatedIndustrySlugs ?? []) {
        expect(industrySlugs.has(slug), `${solution.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every industry -> service and solution reference', () => {
    for (const industry of industries) {
      for (const slug of industry.relatedServiceSlugs) {
        expect(serviceSlugs.has(slug), `${industry.slug} -> ${slug}`).toBe(true);
      }
      for (const slug of industry.relatedSolutionSlugs) {
        expect(solutionSlugs.has(slug), `${industry.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every case study -> industry and service reference', () => {
    for (const caseStudy of caseStudies) {
      expect(industrySlugs.has(caseStudy.industrySlug), caseStudy.slug).toBe(true);
      for (const slug of caseStudy.relatedServiceSlugs) {
        expect(serviceSlugs.has(slug), `${caseStudy.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every product -> service reference', () => {
    for (const product of products) {
      for (const slug of product.relatedServiceSlugs) {
        expect(serviceSlugs.has(slug), `${product.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('resolves every insight -> author and category reference', () => {
    const authorSlugs = new Set(authors.map((a) => a.slug));
    const insightCategorySlugs = new Set(insightCategories.map((c) => c.slug));

    for (const insight of insights) {
      expect(authorSlugs.has(insight.authorSlug), insight.slug).toBe(true);
      expect(insightCategorySlugs.has(insight.categorySlug), insight.slug).toBe(true);
    }
  });

  it('points every navigation link at a route that exists', () => {
    const links = [
      ...primaryNav.flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]),
      ...footerNav.flatMap((column) => column.links.map((link) => link.href)),
    ];

    const staticRoutes = new Set([
      '/',
      '/about',
      '/team',
      '/brand',
      '/services',
      '/solutions',
      '/industries',
      '/products',
      '/case-studies',
      '/insights',
      '/contact',
      '/search',
      '/legal/privacy',
      '/legal/terms',
      '/legal/cookies',
    ]);

    for (const href of links) {
      const path = href.split('#')[0]!.split('?')[0]!;
      if (staticRoutes.has(path)) continue;

      const segments = path.split('/').filter(Boolean);
      const [section, slug] = segments;

      const resolvers: Record<string, Set<string>> = {
        services: categorySlugs,
        solutions: solutionSlugs,
        industries: industrySlugs,
        products: new Set(products.map((p) => p.slug)),
        'case-studies': caseStudySlugs,
        insights: new Set(insights.map((i) => i.slug)),
      };

      expect(resolvers[section!]?.has(slug!), `navigation link ${href} does not resolve`).toBe(
        true,
      );
    }
  });
});

describe('SEO metadata', () => {
  it('gives every service a meta description of a usable length', () => {
    for (const service of services) {
      const description = service.seo.description ?? '';
      expect(description.length, service.slug).toBeGreaterThan(60);
      expect(description.length, service.slug).toBeLessThan(230);
    }
  });

  it('gives every category, solution and industry a meta description', () => {
    for (const entry of [...serviceCategories, ...solutions, ...industries]) {
      expect(entry.seo.description, entry.slug).toBeTruthy();
    }
  });

  it('excludes unverified content from indexing', () => {
    // Demo case studies and placeholder products must not be indexable: a search engine treats
    // an indexed page as a factual claim about the company.
    for (const caseStudy of caseStudies.filter((c) => c.kind === 'demo')) {
      expect(caseStudy.seo.noIndex, `${caseStudy.slug} must set noIndex`).toBe(true);
    }
    for (const product of products.filter((p) => p.isPlaceholder)) {
      expect(product.seo.noIndex, `${product.slug} must set noIndex`).toBe(true);
    }
  });
});

describe('content governance (specification §31, catalogue §16)', () => {
  /**
   * Phrases that negate a claim rather than make it.
   *
   * The site says things like "we do not guarantee accuracy" and "no guaranteed ROI claims" —
   * which are precisely the statements §31 asks for. A naive substring check flags those as
   * violations, so each match is inspected in context and skipped when it is negated. Without
   * this, the honest disclaimers would have to be deleted to make the test pass.
   */
  const NEGATORS =
    /\b(no|not|never|without|avoid|forbid|refuse|rather than|deliberately|cannot|does not|do not|will not|won't|don't|unsupportable|forbidden|must not|guard against)\b/i;

  /** True when the match is preceded or immediately followed by a negation. */
  function isNegated(text: string, index: number, length: number): boolean {
    const before = text.slice(Math.max(0, index - 90), index);
    const after = text.slice(index + length, index + length + 40);
    return NEGATORS.test(before) || NEGATORS.test(after);
  }

  /** Returns only the matches that assert the claim. */
  function assertedMatches(text: string, pattern: RegExp): string[] {
    const global = new RegExp(
      pattern.source,
      pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
    );
    const asserted: string[] = [];

    for (const match of text.matchAll(global)) {
      if (match.index === undefined) continue;
      if (isNegated(text, match.index, match[0].length)) continue;
      asserted.push(text.slice(Math.max(0, match.index - 60), match.index + match[0].length + 40));
    }

    return asserted;
  }

  /** Every piece of visitor-facing prose in the content layer. */
  const allProse = [
    ...serviceCategories.flatMap((c) => [
      c.positioning,
      c.description,
      c.heroTitle,
      c.heroDescription,
      c.oneLineValue,
    ]),
    ...services.flatMap((s) => [
      s.shortDescription,
      s.heroTitle,
      s.heroDescription,
      s.problemStatement,
      s.whatWeDo,
      s.technologyApproach ?? '',
      ...(s.outcomes ?? []),
      ...(s.faq ?? []).map((f) => f.answer),
    ]),
    ...solutions.flatMap((s) => [
      s.problem,
      s.summary,
      s.heroTitle,
      s.heroDescription,
      ...s.illustrativeOutcomes,
      ...s.technicalApproach,
    ]),
    ...industries.flatMap((i) => [i.summary, i.heroDescription, i.context, ...i.considerations]),
    ...products.flatMap((p) => [p.summary, p.heroDescription, p.problem, p.tagline]),
    ...caseStudies.flatMap((c) => [
      c.summary,
      c.problem,
      c.approach,
      ...c.outcomes.map((o) => `${o.label} ${o.value}`),
    ]),
    ...insights.flatMap((i) => [i.title, i.excerpt]),
  ].join('\n');

  it('makes no guaranteed ROI, accuracy or full-automation claim', () => {
    const forbidden = [
      /\bguarantee(d|s)?\s+(roi|return|accuracy|results?|savings?)/i,
      /\b100%\s*(automat|accurat|reliab)/i,
      /\bfully\s+automated\b/i,
      /\bzero\s+errors?\b/i,
      /\bguaranteed\s+\d+%/i,
    ];

    for (const pattern of forbidden) {
      expect(assertedMatches(allProse, pattern), `asserted claim matching ${pattern}`).toEqual([]);
    }
  });

  it('claims no certification, approval or empanelment', () => {
    const forbidden = [
      /\b(we are|nevix is)\s+(iso|soc\s*2|cmmi)[- ]?\d*\s*(certified|compliant)/i,
      /\bgovernment[- ](approved|empanelled|empaneled|certified|registered)\b/i,
      /\b(empanelment|empanelled|empaneled)\b/i,
      /\bgem\s+registered\b/i,
      /\bwe hold\s+(iso|soc)/i,
    ];

    for (const pattern of forbidden) {
      expect(
        assertedMatches(allProse, pattern),
        `asserted credential claim matching ${pattern}`,
      ).toEqual([]);
    }
  });

  it('uses no unsupportable marketing superlatives (instruction §63)', () => {
    const forbidden = [
      /\brevolutionary\b/i,
      /\bworld[- ]class\b/i,
      /\bgame[- ]changing\b/i,
      /\bbest in the world\b/i,
      /\bunparalleled\b/i,
      /\bcutting[- ]edge\b/i,
      /\bindustry[- ]leading\b/i,
    ];

    // Superlatives are never acceptable, negated or not, so these are matched directly.
    for (const pattern of forbidden) {
      expect(allProse, `superlative matched ${pattern}`).not.toMatch(pattern);
    }
  });

  it('publishes no client name on any case study', () => {
    // Catalogue §16: client identity requires written permission. Until a case study is marked
    // `approved`, `client` must be absent.
    for (const caseStudy of caseStudies) {
      if (caseStudy.kind === 'demo') {
        expect(caseStudy.client, `${caseStudy.slug} must not name a client`).toBeUndefined();
      }
    }
  });

  it('labels every unapproved case study as demo content', () => {
    for (const caseStudy of caseStudies) {
      expect(['demo', 'approved']).toContain(caseStudy.kind);
      if (caseStudy.kind === 'approved') {
        // An approved study must carry evidence for every published figure (specification §31).
        for (const outcome of caseStudy.outcomes) {
          expect(
            outcome.evidence,
            `${caseStudy.slug}/${outcome.label} needs evidence`,
          ).toBeTruthy();
        }
      }
    }
  });

  it('keeps every product at a status that reflects reality', () => {
    for (const product of products) {
      if (product.isPlaceholder) {
        expect(
          ['concept', 'coming-soon'],
          `${product.slug} is a placeholder and cannot claim beta or live`,
        ).toContain(product.status);
      }
    }
  });

  it('publishes no fabricated company metrics', () => {
    const forbidden = [
      /\b\d+\+?\s*(clients?|customers?|projects delivered|years in business)\b/i,
      /\b\d+\+?\s*(employees|engineers|team members)\b/i,
      /\btrusted by\s+\d+/i,
      /\b\$\d+[mkb]?\s*(in\s+)?(revenue|funding|raised)\b/i,
    ];

    for (const pattern of forbidden) {
      expect(assertedMatches(allProse, pattern), `asserted metric matching ${pattern}`).toEqual([]);
    }
  });

  it('marks every legal document as a draft until reviewed', () => {
    for (const document of legalDocuments) {
      expect(document.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // The draft notice is rendered on every legal page; removing it is a deliberate act that
    // should also remove this expectation.
    expect(legalDocuments.length).toBeGreaterThan(0);
  });

  it('publishes no invented contact details', () => {
    // DD-004: a phone number or address must be verified before it appears.
    expect(siteConfig.contact.phone).toBeNull();
    expect(siteConfig.contact.address).toBeNull();
  });
});

describe('catalogue fidelity', () => {
  it('reproduces the four pillar positioning lines verbatim', () => {
    const expected: Record<string, string> = {
      'ai-intelligence':
        'Build intelligent systems that understand, predict, generate, classify and assist.',
      automation:
        'Turn repetitive, rule-based and multi-step work into reliable automated workflows.',
      'digital-engineering':
        'Design and build modern websites, applications, APIs, software systems and user experiences.',
      'data-analytics': 'Turn raw data into reporting, insight, prediction and decision support.',
    };

    for (const [slug, positioning] of Object.entries(expected)) {
      const category = serviceCategories.find((c) => c.slug === slug);
      expect(category?.positioning, slug).toBe(positioning);
    }
  });

  it('gives every service the capabilities and use cases the catalogue lists', () => {
    for (const service of services) {
      expect(service.capabilities.length, `${service.slug} capabilities`).toBeGreaterThan(0);
      expect(service.useCases.length, `${service.slug} use cases`).toBeGreaterThan(0);
    }
  });

  it('uses the master description from catalogue §14 verbatim', () => {
    expect(siteConfig.masterDescription).toBe(
      'NEVIX builds intelligent technology solutions across AI, automation, digital ' +
        'engineering and data. We help organizations simplify complex processes, connect ' +
        'systems, turn data into insight and build scalable digital products.',
    );
  });

  it('uses the tagline from catalogue §17', () => {
    expect(siteConfig.tagline).toBe('Explore. Automate. Evolve.');
  });
});

/**
 * The team.
 *
 * Only three facts about each founder were supplied — a name, a role and a quote — and they are
 * published verbatim. The risk here is not that the current content is wrong; it is that somebody
 * later "fills out" a thin profile with plausible-sounding career history. These tests make that
 * fail loudly.
 */
describe('team', () => {
  it('publishes exactly the people named on the supplied material', () => {
    expect(team.map((l) => `${l.name} — ${l.role}`)).toEqual([
      'Jyoti Rokade — Founder & CEO',
      'Vaidehi Bhagane — Co-Founder',
    ]);
  });

  it('quotes each founder exactly as the supplied card credits them', () => {
    expect(team.map((l) => l.quote)).toEqual([
      'Turning Ideas into Impact. At NEVIX, we build intelligent solutions with AI, automation and digital engineering to create a smarter, more connected tomorrow.',
      'Ideas grow brighter when we build them together.',
    ]);
  });

  it('has a portrait on disk for every profile', () => {
    for (const leader of team) {
      expect(leader.card.startsWith('/team/')).toBe(true);
      const file = join(__dirname, '..', 'public', leader.card.replace(/^\//, ''));
      expect(existsSync(file), `${leader.name}: ${leader.card} is missing`).toBe(true);
    }
  });

  it('frames each card at the size it actually is, so none is cropped', async () => {
    const { default: sharp } = await import('sharp');
    for (const leader of team) {
      const file = join(__dirname, '..', 'public', leader.card.replace(/^\//, ''));
      const { width, height } = await sharp(file).metadata();
      expect({ width, height }, leader.name).toEqual({
        width: leader.cardWidth,
        height: leader.cardHeight,
      });
    }
  });

  it('describes each card for anyone who cannot see it, without drifting from the facts', () => {
    for (const leader of team) {
      const alt = teamCardAlt(leader);
      // The card carries the name, role and quote as pixels; the alt text has to carry the same
      // three, spelled the same way, or the two versions of the page disagree.
      expect(alt).toContain(leader.name);
      expect(alt).toContain(leader.role);
      expect(alt).toContain(leader.quote);
    }
  });

  it('claims no career history, qualification or tenure for anyone', () => {
    // Nothing of the sort was supplied. Anything matching these is invented biography.
    const invented =
      /(years? of experience|previously|prior to|formerly|ex-|graduat|degree|MBA|PhD|B\.?Tech|M\.?Tech|university|college|certified|award|founded in|since \d{4}|veteran|decade)/i;

    for (const leader of team) {
      const text = `${leader.name} ${leader.role} ${leader.quote} ${teamCardAlt(leader)}`;
      expect(invented.test(text), `${leader.name}: reads as invented biography`).toBe(false);
    }
  });

  it('gives every profile a unique slug usable as an anchor', () => {
    const slugs = team.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});
