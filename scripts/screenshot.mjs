/**
 * Captures screenshots of the running site for visual review.
 *
 * Usage: node scripts/screenshot.mjs <baseUrl> <outDir> <path> [path...]
 * Each path is captured at desktop (1440), tablet (834) and mobile (390) widths.
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const [baseUrl, outDir, ...paths] = process.argv.slice(2);
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
];

const only = process.env.VIEWPORTS?.split(',');
const viewports = only ? VIEWPORTS.filter((v) => only.includes(v.name)) : VIEWPORTS;
const fullPage = process.env.FULL_PAGE !== 'false';

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    // Screenshots should show the non-animated end state, not a mid-transition frame.
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  for (const path of paths) {
    const url = `${baseUrl}${path}`;
    // `networkidle` never settles here: Next.js keeps route-prefetch requests in flight.
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load').catch(() => {});
    // Let fonts and lazy images settle so screenshots are not captured mid-layout.
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForTimeout(600);
    const name = (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_')) || 'home';
    const file = join(outDir, `${name}.${viewport.name}.png`);
    await page.screenshot({ path: file, fullPage });

    // Horizontal overflow is the most common responsive defect; check it while we are here.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    console.log(
      `${viewport.name.padEnd(8)} ${String(response?.status()).padEnd(4)} overflow=${String(overflow).padEnd(4)} ${path}`,
    );
  }

  if (consoleErrors.length) {
    console.log(`  console errors (${viewport.name}):`);
    for (const e of [...new Set(consoleErrors)].slice(0, 8)) console.log(`    ${e}`);
  }

  await context.close();
}

await browser.close();
