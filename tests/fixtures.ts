import { test as base, expect, request as pwRequest } from '@playwright/test';
import { ContractsClient } from '../src/client/contractsClient.js';
import { getEnvConfig, getSeedData, hasCredentials, type SeedData } from '../src/client/config.js';

/**
 * Test fixtures: a signed ContractsClient plus seed-data/credential helpers.
 *
 * The `client` fixture builds a Playwright APIRequestContext bound to the
 * configured environment origin and wraps it in our signed client.
 */
interface Fixtures {
  client: ContractsClient;
  seed: SeedData;
}

export const test = base.extend<Fixtures>({
  client: async ({}, use) => {
    const ctx = await pwRequest.newContext({ baseURL: getEnvConfig().origin });
    await use(new ContractsClient(ctx));
    await ctx.dispose();
  },
  seed: async ({}, use) => {
    await use(getSeedData());
  },
});

export { expect };
export { hasCredentials };

/** Skip the whole describe block when no credentials are configured. */
export function requireCredentials(): void {
  test.skip(!hasCredentials(), 'No Contracts API credentials configured (set CONTRACTS_* env vars).');
}
