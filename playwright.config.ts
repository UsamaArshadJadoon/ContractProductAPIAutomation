import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env (gitignored) for local runs. In CI, values come from the environment / secrets.
dotenv.config();

/**
 * Playwright configuration for the Contracts API automation suite.
 *
 * No `baseURL` is set here on purpose: the signed client computes the full
 * URL (including the `/api` or `/api/v2` prefix) itself, because the request
 * path is part of the HMAC signature. See src/client/contractsClient.ts.
 */
export default defineConfig({
  testDir: './tests',
  // The signer/unit tests are deterministic; live API tests hit a shared
  // sandbox, so keep network tests serial-ish per file but allow file-level
  // parallelism. CI overrides workers via the CLI when needed.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
    // Extra time for base64 document uploads/downloads.
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: 'unit',
      testMatch: /tests\/unit\/.*\.spec\.ts/,
    },
    {
      // Single account-health probe. The `api` project depends on it, so a
      // deactivated company fails fast here with one clear message instead of
      // scattered red across every data-dependent test.
      name: 'health',
      testMatch: /tests\/setup\/account-health\.setup\.ts/,
    },
    {
      name: 'api',
      testIgnore: [/tests\/unit\/.*\.spec\.ts/, /tests\/setup\/.*/],
      dependencies: ['health'],
    },
  ],
});
