/**
 * Page-level quality sweep against a running site.
 *
 * Checks each route at three viewports for:
 *  - HTTP status
 *  - horizontal overflow (the most common responsive defect)
 *  - console and page errors
 *  - failed sub-requests
 *  - axe-core accessibility violations (WCAG 2.0/2.1/2.2 A and AA)
 *  - exactly one <h1> and a sane heading order
 *
 * Usage: node scripts/audit-pages.mjs <baseUrl> [--viewports=desktop,mobile]
 */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.argv[2] ?? 'http://localhost:3100';
const viewportArg = process.argv.find((a) => a.startsWith('--viewports='));
const only = viewportArg?.split('=')[1]?.split(',');

const ALL_VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];
const viewports = only ? ALL_VIEWPORTS.filter((v) => only.includes(v.name)) : ALL_VIEWPORTS;

const ROUTES = [
  '/',
  '/about',
  '/services',
  '/services/ai-intelligence',
  '/services/automation',
  '/services/digital-engineering',
  '/services/data-analytics',
  '/services/product-saas-engineering',
  '/services/consulting',
  '/services/ai-intelligence/document-intelligence',
  '/services/automation/intelligent-automation',
  '/services/digital-engineering/website-development',
  '/services/data-analytics/business-intelligence-dashboards',
  '/services/product-saas-engineering/mvp-development',
  '/services/consulting/solution-architecture',
  '/solutions',
  '/solutions/ai-document-processing',
  '/solutions/intelligent-ticket-triage',
  '/industries',
  '/industries/government-public-sector',
  '/industries/finance',
  '/products',
  '/products/document-intelligence-platform',
  '/case-studies',
  '/case-studies/invoice-to-workflow-automation',
  '/insights',
  '/insights/evaluation-before-prompts',
  '/insights/category/ai',
  '/insights/tag/architecture',
  '/contact',
  '/search?q=document',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/this-route-does-not-exist',
];

const problems = [];
let checks = 0;

const browser = await chromium.launch();

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    checks += 1;
    const consoleErrors = [];
    const failedRequests = [];

    const onConsole = (m) => m.type() === 'error' && consoleErrors.push(m.text());
    const onPageError = (e) => consoleErrors.push(`pageerror: ${e.message}`);
    const onResponse = (r) => {
      if (r.status() >= 400 && !r.url().includes('this-route-does-not-exist')) {
        failedRequests.push(`${r.status()} ${r.url().replace(baseUrl, '')}`);
      }
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('response', onResponse);

    const expected404 = route === '/this-route-does-not-exist';
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await page.waitForLoadState('load').catch(() => {});
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForTimeout(350);

    const status = response?.status() ?? 0;
    if (expected404 ? status !== 404 : status !== 200) {
      problems.push(`[status] ${viewport.name} ${route} -> ${status}`);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) problems.push(`[overflow] ${viewport.name} ${route} -> ${overflow}px`);

    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((el) =>
        Number(el.tagName[1]),
      );
      let skip = null;
      for (let i = 1; i < levels.length; i += 1) {
        if (levels[i] - levels[i - 1] > 1) {
          skip = `h${levels[i - 1]} -> h${levels[i]}`;
          break;
        }
      }
      return { h1, skip };
    });
    if (headings.h1 !== 1) {
      problems.push(`[h1] ${viewport.name} ${route} -> ${headings.h1} h1 elements`);
    }
    if (headings.skip) {
      problems.push(`[heading-order] ${viewport.name} ${route} -> ${headings.skip}`);
    }

    // axe runs once per route, on desktop only: violations are rarely viewport-specific and the
    // scan is the slow part of this sweep.
    if (viewport.name === 'desktop') {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();

      for (const violation of results.violations) {
        problems.push(
          `[a11y:${violation.impact}] ${route} -> ${violation.id}: ${violation.help} (${violation.nodes.length} node(s))\n      ${violation.nodes[0]?.target?.join(' ') ?? ''}`,
        );
      }
    }

    for (const error of [...new Set(consoleErrors)]) {
      // The 404 probe is expected to log a failed navigation; that is the assertion, not a defect.
      if (expected404 && error.includes('404')) continue;
      problems.push(`[console] ${viewport.name} ${route} -> ${error.slice(0, 160)}`);
    }
    for (const failure of [...new Set(failedRequests)]) {
      problems.push(`[request] ${viewport.name} ${route} -> ${failure}`);
    }

    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('response', onResponse);
  }

  await context.close();
}

await browser.close();

console.log(`\nChecked ${checks} page loads across ${viewports.length} viewport(s).`);
if (problems.length === 0) {
  console.log('No problems found.');
} else {
  console.log(`\n${problems.length} problem(s):\n`);
  for (const problem of problems) console.log('  ' + problem);
  process.exitCode = 1;
}
