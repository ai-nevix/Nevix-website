import { expect, test } from '@playwright/test';

/**
 * The NEVIX welcome intro.
 *
 * The animation itself needs no test — a screenshot comparison of a cinematic reveal would fail on
 * every deliberate change and catch nothing that matters. What does need testing is everything
 * around it: when it plays, when it must not, and that a visitor can always get past it. Each of
 * those rules exists to stop the intro becoming an irritation or a barrier, and every one of them
 * would fail silently.
 *
 * Note on sessions: `sessionStorage` is per tab, so a fresh `page` is a fresh session. Anything
 * about reloads therefore has to happen on the same page object.
 */

const INTRO = '[data-nevix-intro]';
/** Comfortably longer than the ~3.5s sequence, so a slow CI machine does not fail the suite. */
const SETTLE = 9000;

test.describe('Welcome intro', () => {
  test('plays on a first homepage visit and then clears itself', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });

    await expect(page.locator(INTRO)).toBeVisible();

    // It must get out of the way on its own.
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: SETTLE });

    // The page beneath is the real homepage, and it scrolls again.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Intelligence in Motion');
    await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  });

  test('can be skipped with the button, immediately', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });

    const skip = page.getByRole('button', { name: /skip intro/i });
    await expect(skip).toBeVisible();
    await skip.click();

    // Gone well before the sequence would have ended on its own.
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 2000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('can be skipped from the keyboard, by tabbing to the button and by Escape', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'commit' });

    const skip = page.getByRole('button', { name: /skip intro/i });
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 2000 });

    // And Escape, in a new session.
    await page.context().clearCookies();
    const second = await page.context().newPage();
    await second.goto('/', { waitUntil: 'commit' });
    await expect(second.locator(INTRO)).toBeVisible();
    await second.keyboard.press('Escape');
    await expect(second.locator(INTRO)).toHaveCount(0, { timeout: 2000 });
    await second.close();
  });

  test('does not replay on reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator(INTRO)).toBeVisible();
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: SETTLE });

    await page.reload({ waitUntil: 'commit' });
    await expect(page.locator(INTRO)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('does not replay when returning home by client-side navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: SETTLE });

    // Whichever /about link this viewport exposes — on mobile the header nav is behind the menu.
    await page.locator('a[href="/about"]:visible').first().click();
    await page.waitForURL('**/about');
    await page.goBack();

    await expect(page.locator(INTRO)).toHaveCount(0);
  });

  test('never appears on a page other than the homepage', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(INTRO)).toHaveCount(0);

    // Arriving elsewhere first must not consume the visit, or the homepage would never show it.
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator(INTRO)).toBeVisible();
  });

  test('leaves the page content in the HTML for crawlers', async ({ request }) => {
    // The intro must not cost anything in SEO terms: the homepage is prerendered, and the overlay
    // is painted over content that is already there.
    const html = await (await request.get('/')).text();
    expect(html).toContain('Intelligence');
    expect(html).toContain('Explore. Automate. Evolve.');
  });
});

test.describe('Welcome intro with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('is not shown at all', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });

    // Not merely shortened. The site-wide reduced-motion rule collapses animations to 0.01ms,
    // which would flash a full-screen curtain and snap it away — worse than the motion it
    // replaces. So the intro is never armed in the first place.
    await expect(page.locator(INTRO)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  });
});

test.describe('Welcome intro without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('is not shown, so nothing is left covering the page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });

    // The curtain is opt-in: it is painted only once a script has armed it. The reverse
    // arrangement would leave a visitor whose JavaScript failed staring at a screen that nothing
    // could clear.
    await expect(page.locator(INTRO)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  });
});
