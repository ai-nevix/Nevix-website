import { expect, test } from '@playwright/test';

/**
 * Critical end-to-end flows — specification §27.1.
 *
 * The specification names seven flows explicitly. Each has a test here, plus the routing,
 * SEO and error-handling checks the quality gate in instruction §79 requires.
 *
 * These exercise the production build through a real browser: if one fails, a visitor would hit
 * the same problem.
 */

test.describe('Flow 1 — Home to a service detail page', () => {
  test('navigates Home -> Services -> AI & Intelligence -> service detail', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Intelligent Technology');

    // The four pillars are reachable from the hero without opening a menu (specification §10.1:
    // no critical content may depend on hover).
    await page
      .getByRole('navigation', { name: 'Core capabilities' })
      .getByRole('link', { name: 'AI & Intelligence' })
      .click();

    await expect(page).toHaveURL(/\/services\/ai-intelligence$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Document Intelligence' }).first().click();
    await expect(page).toHaveURL(/\/services\/ai-intelligence\/document-intelligence$/);

    // The service page carries the structure the catalogue requires.
    await expect(page.getByText('The problem we solve')).toBeVisible();
    await expect(page.getByText('What we do')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What you get' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Where it applies' })).toBeVisible();
  });
});

test.describe('Flow 2 — Services to an enquiry', () => {
  test('carries the selected service through to the contact form', async ({ page }) => {
    await page.goto('/services/automation');

    // Scoped to main: the header carries its own "Discuss a Project" CTA, which deliberately
    // links to a plain /contact because it has no page context to pass on.
    await page.getByRole('main').getByRole('link', { name: 'Discuss a Project' }).first().click();

    await expect(page).toHaveURL(/\/contact\?interest=automation/);

    const interest = page.getByLabel('What are you interested in?');
    await expect(interest).toHaveValue('Automation');
  });
});

test.describe('Flow 3 — Case studies', () => {
  test('labels demonstration content before showing any of it', async ({ page }) => {
    await page.goto('/case-studies');

    // Catalogue §16: unapproved case studies must never read as delivered client work.
    await expect(page.getByText('These are demonstration case studies')).toBeVisible();

    await page
      .getByRole('link', { name: /Invoice-to-Workflow Automation/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/case-studies\/invoice-to-workflow-automation$/);

    await expect(page.getByText('Demo Case Study — illustrative example')).toBeVisible();
    await expect(page.getByText('Not applicable — demonstration content')).toBeVisible();

    // And it must not be indexable.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('Flow 4 — Insights', () => {
  test('opens an article with correct metadata and navigation', async ({ page }) => {
    await page.goto('/insights');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page
      .getByRole('link', { name: /Build the evaluation set/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/insights\/evaluation-before-prompts$/);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('evaluation set');
    await expect(page.locator('time').first()).toBeVisible();

    // Article structured data is emitted for search engines.
    const articleSchema = page.locator('script#ld-article-evaluation-before-prompts');
    await expect(articleSchema).toHaveCount(1);

    const payload = JSON.parse((await articleSchema.textContent()) ?? '{}');
    expect(payload['@type']).toBe('Article');
    expect(payload.headline).toBeTruthy();
    expect(payload.datePublished).toBeTruthy();
  });
});

test.describe('Flow 5 — Contact form validation', () => {
  test('blocks an invalid submission and explains why, accessibly', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    // Errors are announced, not merely coloured (specification §23.3).
    const alerts = page.getByRole('alert');
    await expect(alerts.first()).toBeVisible();

    // The invalid control is marked for assistive technology.
    await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true');

    // Nothing was submitted.
    await expect(page.getByText('Thank you — we have your enquiry')).toHaveCount(0);
  });

  test('rejects a requirement that is too short', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Your name').fill('Test Person');
    await page.getByLabel('Work email').fill('test@example.org');
    await page.getByLabel('What are you trying to solve?').fill('Too short');
    await page.getByLabel(/I am happy for VASTRIX to contact me/).check();

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText(/at least 20 characters/i)).toBeVisible();
  });

  test('rejects a malformed email address', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Your name').fill('Test Person');
    await page.getByLabel('Work email').fill('not-an-email');
    await page
      .getByLabel('What are you trying to solve?')
      .fill('A requirement long enough to satisfy the minimum length validation rule.');
    await page.getByLabel(/I am happy for VASTRIX to contact me/).check();

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });
});

test.describe('Flow 6 — Valid contact submission', () => {
  test('shows a confirmation with a reference when the API accepts it', async ({ page }) => {
    // The backend is not running in this suite, so the endpoint is stubbed. This verifies the
    // browser-side contract and the success state; the API itself is covered by the pytest suite.
    await page.route('**/api/backend/v1/contact', async (route) => {
      const body = route.request().postDataJSON();

      // The client must send exactly what the API expects.
      expect(body.name).toBe('Test Person');
      expect(body.email).toBe('test@example.org');
      expect(body.consent).toBe(true);
      expect(body.service_interest).toBeTruthy();

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000001',
          reference: 'VX-TEST01',
          message: 'Thank you — your enquiry has been received.',
          notification_sent: true,
        }),
      });
    });

    await page.goto('/contact');

    await page.getByLabel('Your name').fill('Test Person');
    await page.getByLabel('Work email').fill('test@example.org');
    await page.getByLabel('Organisation').fill('Example Organisation');
    await page.getByLabel('What are you interested in?').selectOption('Automation');
    await page
      .getByLabel('What are you trying to solve?')
      .fill('We process around two thousand supplier invoices a month entirely by hand.');
    await page.getByLabel(/I am happy for VASTRIX to contact me/).check();

    // The form rejects submissions faster than a person could complete it.
    await page.waitForTimeout(3200);

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText('Thank you — we have your enquiry')).toBeVisible();
    await expect(page.getByText('VX-TEST01')).toBeVisible();
  });

  test('explains a rate-limit response without alarming the visitor', async ({ page }) => {
    await page.route('**/api/backend/v1/contact', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'rate_limited',
            message: 'You have made several requests in a short time.',
          },
        }),
      });
    });

    await page.goto('/contact');

    await page.getByLabel('Your name').fill('Test Person');
    await page.getByLabel('Work email').fill('test@example.org');
    await page
      .getByLabel('What are you trying to solve?')
      .fill('A requirement long enough to satisfy the minimum length validation rule.');
    await page.getByLabel(/I am happy for VASTRIX to contact me/).check();
    await page.waitForTimeout(3200);

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText('We could not send that')).toBeVisible();
    await expect(page.getByText(/wait a few minutes/i)).toBeVisible();
  });
});

test.describe('Flow 7 — Routing and error handling', () => {
  const routes = [
    '/',
    '/about',
    '/services',
    '/services/ai-intelligence',
    '/services/automation',
    '/services/digital-engineering',
    '/services/data-analytics',
    '/services/product-saas-engineering',
    '/services/consulting',
    '/solutions',
    '/industries',
    '/products',
    '/case-studies',
    '/insights',
    '/contact',
    '/search',
    '/legal/privacy',
  ];

  for (const route of routes) {
    test(`serves ${route} with exactly one h1`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return 200`).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('returns a usable 404 page with navigation intact', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /does not exist/i })).toBeVisible();

    // A dead end is not acceptable: the visitor can still get somewhere useful.
    await expect(page.getByRole('link', { name: 'Back to the homepage' })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('redirects the legacy /blog and /projects paths', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/insights$/);

    await page.goto('/projects');
    await expect(page).toHaveURL(/\/case-studies$/);
  });
});

test.describe('Search', () => {
  test('finds content and works from a shareable URL', async ({ page }) => {
    await page.goto('/search');

    await page.getByLabel('Search VASTRIX').fill('document');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/search\?q=document/);
    await expect(page.getByText(/results? for/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Document Intelligence/ }).first()).toBeVisible();
  });

  test('offers a route forward when nothing matches', async ({ page }) => {
    await page.goto('/search?q=zzzznotarealterm');
    await expect(page.getByText(/No results for/)).toBeVisible();

    // Scoped to main: the header CTA "Discuss a Project" also matches this accessible name.
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Discuss a project' }),
    ).toBeVisible();
  });
});
