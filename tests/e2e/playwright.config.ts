import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the VASTRIX end-to-end suite.
 *
 * Tests run against the production build served by the standalone server — the same artifact the
 * container runs. Running them against `next dev` would exercise different code paths (no static
 * generation, different bundling) and would not tell us the release works.
 */
const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: '.',
  /**
   * Artifacts (traces, screenshots) are written here.
   *
   * Override with PLAYWRIGHT_OUTPUT_DIR when the checkout sits inside a synced folder such as
   * OneDrive or Dropbox: the sync client locks files mid-write and Playwright fails to finalise
   * the trace with "ENOENT ... .playwright-artifacts-*", which aborts the browser context and
   * fails tests for a reason unrelated to the application.
   */
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? '../../test-results',
  fullyParallel: true,
  // A test that only passes locally is a liability in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI
    ? [
        ['junit', { outputFile: '../../test-results/junit.xml' }],
        ['html', { open: 'never', outputFolder: '../../playwright-report' }],
        ['list'],
      ]
    : [['list']],

  use: {
    baseURL,
    // Video capture is disabled: on Windows it intermittently fails to finalise the artifact
    // ("ENOENT ... .playwright-artifacts-*.zip"), which aborts the browser context and fails
    // every test for a reason unrelated to the application. Traces give the same diagnostic value
    // without that failure mode.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],

  // Reuses an already-running server locally so the suite is fast to iterate on; always starts a
  // fresh one in CI.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `node scripts/serve-standalone.mjs ${PORT}`,
        url: `http://127.0.0.1:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        cwd: '../..',
      },
});
