import { expect, test } from '@playwright/test';

/**
 * The Brand page is hidden for now (BRAND_PAGE_ENABLED = false in apps/web/content/brand.ts).
 *
 * Hidden has to mean hidden everywhere: the route answers 404, and no page, footer or sitemap
 * points a visitor or a crawler at it. When the page is switched back on, delete this file.
 */
test.describe('Brand page (hidden)', () => {
  test('answers 404', async ({ page }) => {
    const response = await page.goto('/brand');
    expect(response?.status()).toBe(404);
  });

  test('is linked from nowhere a visitor can reach', async ({ page }) => {
    for (const path of ['/', '/about', '/team', '/contact']) {
      await page.goto(path);
      await expect(page.locator('a[href="/brand"]'), `link to /brand on ${path}`).toHaveCount(0);
    }
  });

  test('is left out of the sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toMatch(/\/brand<\/loc>/);
  });
});
