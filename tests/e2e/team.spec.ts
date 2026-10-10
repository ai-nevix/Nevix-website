import { expect, test } from '@playwright/test';

/**
 * The team page.
 *
 * The cards are published as supplied artwork, so the name, role and quote a visitor reads are
 * pixels. That is a deliberate choice, and it puts the burden somewhere else: everything that
 * cannot see a picture has to be served the same facts another way. These tests check that the
 * alternative routes actually carry them, because a screenshot would look perfect either way.
 */

const TEAM = [
  { name: 'Jyoti Rokade', role: 'Founder & CEO' },
  { name: 'Vaidehi Bhagane', role: 'Co-Founder' },
];

test.describe('Team page', () => {
  test('shows each card whole, with the person described in its alternative text', async ({
    page,
  }) => {
    await page.goto('/team');

    for (const member of TEAM) {
      const image = page.getByRole('img', { name: new RegExp(member.name) });
      await expect(image).toBeVisible();

      // The alt text has to carry what the picture says, or the card is silent to a screen reader.
      const alt = (await image.getAttribute('alt')) ?? '';
      expect(alt).toContain(member.name);
      expect(alt).toContain(member.role);

      // Published uncropped: the frame is square, like the supplied card.
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    }
  });

  test('gives every member a heading and an anchor, even though neither is visible', async ({
    page,
  }) => {
    await page.goto('/team');

    for (const member of TEAM) {
      // Visually hidden, but a real heading — an alt attribute cannot provide document structure.
      await expect(page.getByRole('heading', { name: member.name })).toHaveCount(1);
    }

    await page.goto('/team#vaidehi-bhagane');
    await expect(page.locator('#vaidehi-bhagane')).toBeVisible();
  });

  test('emits Person structured data for each member', async ({ page }) => {
    await page.goto('/team');

    const payload = JSON.parse((await page.locator('script#ld-team').textContent()) ?? '{}');
    const people = payload['@graph'] as { '@type': string; name: string; jobTitle: string }[];

    expect(people).toHaveLength(TEAM.length);
    for (const [index, member] of TEAM.entries()) {
      expect(people[index]!['@type']).toBe('Person');
      expect(people[index]!.name).toBe(member.name);
      expect(people[index]!.jobTitle).toBe(member.role);
    }
  });

  test('is reachable from the footer, and the old /leadership URL still works', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('footer a[href="/team"]').first().click();
    await expect(page).toHaveURL(/\/team$/);

    // The page was briefly published at /leadership; that link must not break.
    await page.goto('/leadership');
    await expect(page).toHaveURL(/\/team$/);
  });

  test('has exactly one h1 and is indexable', async ({ page }) => {
    await page.goto('/team');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test('claims nothing beyond the name, role and quote', async ({ page }) => {
    await page.goto('/team');
    const text = (await page.getByRole('main').innerText()).toLowerCase();

    for (const invented of [
      'years of experience',
      'previously',
      'formerly',
      'graduated',
      'mba',
      'phd',
      'certified',
      'award-winning',
    ]) {
      expect(text, `team page should not claim "${invented}"`).not.toContain(invented);
    }
  });
});

test.describe('Team members elsewhere on the site', () => {
  test('do not appear on the homepage or the About page', async ({ page }) => {
    // They live on one page by design; duplicating them was the thing that got removed.
    for (const path of ['/', '/about']) {
      await page.goto(path);
      for (const member of TEAM) {
        await expect(
          page.getByRole('img', { name: new RegExp(member.name) }),
          `${member.name} should not appear on ${path}`,
        ).toHaveCount(0);
      }
    }
  });
});
