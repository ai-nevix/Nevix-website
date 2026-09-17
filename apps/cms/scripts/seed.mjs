/**
 * Seed the Strapi CMS from the typed content committed in `apps/web/content`.
 *
 * This is what makes the provider swap in ADR-006 a real migration path rather than a promise:
 * the same content that ships with the site is pushed into the CMS, so switching
 * CONTENT_PROVIDER from `local` to `strapi` produces an identical site rather than an empty one.
 *
 * Usage:
 *   STRAPI_URL=http://localhost:1337 \
 *   STRAPI_ADMIN_TOKEN=<full-access token> \
 *   node scripts/seed.mjs [--dry-run]
 *
 * The token must have WRITE access, so it is different from the read-only token the website uses.
 * Create it in the Strapi admin under Settings -> API Tokens, use it once, then revoke it.
 *
 * Idempotent: entries are matched on slug and updated rather than duplicated, so the script can
 * be re-run safely.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const contentDir = join(repoRoot, 'apps', 'web', 'content');

const STRAPI_URL = (process.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_ADMIN_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!TOKEN && !DRY_RUN) {
  console.error(
    'STRAPI_ADMIN_TOKEN is required.\n' +
      'Create a full-access API token in the Strapi admin (Settings -> API Tokens),\n' +
      'run this script, then revoke it. Use --dry-run to preview without a token.',
  );
  process.exit(1);
}

/**
 * The content files are TypeScript. Rather than adding a TypeScript runtime to this script, the
 * exported literals are extracted with a small evaluator — the content modules are plain data
 * with no imports beyond types, which are stripped before evaluation.
 */
async function loadContentModule(relativePath, exportName) {
  const source = await readFile(join(contentDir, relativePath), 'utf8');

  const stripped = source
    .replace(/^import\s+type\s+[^;]+;$/gm, '')
    .replace(/^import\s+[^;]+;$/gm, '')
    .replace(/:\s*[A-Z][A-Za-z<>[\]|\s,'"-]*\s*=/g, ' =')
    .replace(/\bexport\s+const\b/g, 'const')
    .replace(/\bexport\s+\{[^}]*\};?/g, '');

  const evaluate = new Function(`${stripped}\nreturn ${exportName};`);
  return evaluate();
}

async function strapi(path, options = {}) {
  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${options.method ?? 'GET'} ${path} -> ${response.status}: ${body.slice(0, 400)}`,
    );
  }

  return response.json();
}

/** Creates or updates an entry, matched on slug. */
async function upsert(collection, slug, data) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would upsert ${collection}/${slug}`);
    return { documentId: `dry-${slug}` };
  }

  const existing = await strapi(
    `/${collection}?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&status=draft`,
  );

  const current = existing.data?.[0];

  if (current) {
    const updated = await strapi(`/${collection}/${current.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    console.log(`  updated ${collection}/${slug}`);
    return updated.data;
  }

  const created = await strapi(`/${collection}`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  console.log(`  created ${collection}/${slug}`);
  return created.data;
}

async function main() {
  console.log(`Seeding ${STRAPI_URL}${DRY_RUN ? ' (dry run)' : ''}\n`);

  // --- Service categories --------------------------------------------------------------------
  console.log('Service categories');
  const categories = await loadContentModule('service-categories.ts', 'serviceCategories');
  const categoryIds = new Map();

  for (const category of categories) {
    const entry = await upsert('service-categories', category.slug, {
      name: category.name,
      slug: category.slug,
      navLabel: category.navLabel,
      positioning: category.positioning,
      oneLineValue: category.oneLineValue,
      cardCta: category.cardCta,
      description: category.description,
      heroTitle: category.heroTitle,
      heroDescription: category.heroDescription,
      icon: category.icon,
      isCorePillar: category.isCorePillar,
      order: category.order,
      seo: category.seo,
    });
    categoryIds.set(category.slug, entry.documentId);
  }

  // --- Industries ----------------------------------------------------------------------------
  console.log('\nIndustries');
  const industries = await loadContentModule('industries.ts', 'industries');
  const industryIds = new Map();

  for (const industry of industries) {
    const entry = await upsert('industries', industry.slug, {
      name: industry.name,
      slug: industry.slug,
      summary: industry.summary,
      heroTitle: industry.heroTitle,
      heroDescription: industry.heroDescription,
      context: industry.context,
      capabilityAreas: industry.capabilityAreas,
      considerations: industry.considerations,
      icon: industry.icon,
      order: industry.order,
      requiresComplianceNotice: industry.requiresComplianceNotice ?? false,
      seo: industry.seo,
    });
    industryIds.set(industry.slug, entry.documentId);
  }

  // --- Solutions -----------------------------------------------------------------------------
  console.log('\nSolutions');
  const solutions = await loadContentModule('solutions.ts', 'solutions');
  const solutionIds = new Map();

  for (const solution of solutions) {
    const entry = await upsert('solutions', solution.slug, {
      name: solution.name,
      slug: solution.slug,
      problem: solution.problem,
      summary: solution.summary,
      heroTitle: solution.heroTitle,
      heroDescription: solution.heroDescription,
      workflow: solution.workflow,
      technicalApproach: solution.technicalApproach,
      illustrativeOutcomes: solution.illustrativeOutcomes,
      industries: (solution.relatedIndustrySlugs ?? [])
        .map((slug) => industryIds.get(slug))
        .filter(Boolean),
      icon: solution.icon,
      order: solution.order,
      seo: solution.seo,
    });
    solutionIds.set(solution.slug, entry.documentId);
  }

  // --- Services ------------------------------------------------------------------------------
  // Written after solutions so the relation targets already exist.
  console.log('\nServices');
  const serviceModules = [
    ['services/ai-intelligence.ts', 'aiIntelligenceServices'],
    ['services/automation.ts', 'automationServices'],
    ['services/digital-engineering.ts', 'digitalEngineeringServices'],
    ['services/data-analytics.ts', 'dataAnalyticsServices'],
    ['services/product-consulting.ts', 'productSaasServices'],
    ['services/product-consulting.ts', 'consultingServices'],
  ];

  const services = [];
  for (const [file, exportName] of serviceModules) {
    services.push(...(await loadContentModule(file, exportName)));
  }

  for (const service of services) {
    await upsert('services', service.slug, {
      name: service.name,
      slug: service.slug,
      category: categoryIds.get(service.categorySlug),
      shortDescription: service.shortDescription,
      heroTitle: service.heroTitle,
      heroDescription: service.heroDescription,
      problemStatement: service.problemStatement,
      whatWeDo: service.whatWeDo,
      capabilities: service.capabilities,
      useCases: service.useCases,
      technologyApproach: service.technologyApproach,
      technologies: service.technologies,
      outcomes: service.outcomes,
      faq: service.faq,
      solutions: (service.solutionSlugs ?? []).map((slug) => solutionIds.get(slug)).filter(Boolean),
      order: service.order,
      seo: service.seo,
    });
  }

  // --- Products ------------------------------------------------------------------------------
  console.log('\nProducts');
  const products = await loadContentModule('products.ts', 'products');

  for (const product of products) {
    await upsert('products', product.slug, {
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      status: product.status,
      summary: product.summary,
      heroTitle: product.heroTitle,
      heroDescription: product.heroDescription,
      problem: product.problem,
      plannedCapabilities: product.plannedCapabilities,
      icon: product.icon,
      isPlaceholder: product.isPlaceholder,
      order: product.order,
      seo: product.seo,
    });
  }

  // --- Case studies --------------------------------------------------------------------------
  console.log('\nCase studies');
  const caseStudies = await loadContentModule('case-studies.ts', 'caseStudies');

  for (const caseStudy of caseStudies) {
    await upsert('case-studies', caseStudy.slug, {
      title: caseStudy.title,
      slug: caseStudy.slug,
      // Preserved exactly: promoting a demo study to 'approved' must be a deliberate editorial
      // decision made in the admin, never a side effect of running a seed script.
      kind: caseStudy.kind,
      client: caseStudy.client ?? null,
      industry: industryIds.get(caseStudy.industrySlug),
      summary: caseStudy.summary,
      problem: caseStudy.problem,
      constraints: caseStudy.constraints,
      approach: caseStudy.approach,
      architecture: caseStudy.architecture,
      implementation: caseStudy.implementation,
      outcomes: caseStudy.outcomes,
      lessonsLearned: caseStudy.lessonsLearned,
      technologies: caseStudy.technologies,
      order: caseStudy.order,
      seo: caseStudy.seo,
    });
  }

  // --- Insight categories and authors --------------------------------------------------------
  console.log('\nInsight categories');
  const insightCategories = await loadContentModule('insights.ts', 'insightCategories');
  const insightCategoryIds = new Map();

  for (const category of insightCategories) {
    const entry = await upsert('insight-categories', category.slug, {
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    insightCategoryIds.set(category.slug, entry.documentId);
  }

  console.log('\nAuthors');
  const authors = await loadContentModule('insights.ts', 'authors');
  const authorIds = new Map();

  for (const author of authors) {
    const entry = await upsert('authors', author.slug, {
      name: author.name,
      slug: author.slug,
      role: author.role,
      bio: author.bio,
    });
    authorIds.set(author.slug, entry.documentId);
  }

  // --- Insights ------------------------------------------------------------------------------
  console.log('\nInsights');
  const insights = await loadContentModule('insights.ts', 'insights');

  for (const insight of insights) {
    await upsert('insights', insight.slug, {
      title: insight.title,
      slug: insight.slug,
      excerpt: insight.excerpt,
      content: insight.content,
      author: authorIds.get(insight.authorSlug),
      category: insightCategoryIds.get(insight.categorySlug),
      tags: insight.tags,
      featured: insight.featured ?? false,
      seo: insight.seo,
    });
  }

  console.log('\nSeed complete.');
  console.log(
    '\nNext steps:\n' +
      '  1. Review and publish the entries in the Strapi admin (they are created as drafts).\n' +
      '  2. Grant find/findOne on each collection to the Public role, or issue a READ-ONLY token.\n' +
      '  3. Set CONTENT_PROVIDER=strapi and CMS_API_TOKEN in the web app environment.\n' +
      '  4. REVOKE the write token used for this seed.',
  );
}

main().catch((error) => {
  console.error('\nSeed failed:', error.message);
  process.exit(1);
});
