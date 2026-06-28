import { test as setup, expect, hasCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import { getContractsQuery } from '../../src/data/payloads.js';
import { ErrorCodes } from '../../src/client/types.js';

/**
 * Account-health gate.
 *
 * Every company-scoped Contracts endpoint resolves the company from the
 * credentials. If the sandbox/UAT environment is reset or the company is
 * deactivated, the API returns E0022 "Company does not exist" for ALL of them
 * (GetContracts, GetContractDetails, UploadContract, ...).
 *
 * Rather than let that surface as scattered red across the suite, the `api`
 * project depends on this single probe. When the company is missing it fails
 * here with ONE actionable message and the data-dependent tests are gated
 * (skipped) behind it — the failure is honest and unmistakable, not buried.
 */
setup('account is provisioned (company exists on the environment)', async ({ client }) => {
  setup.skip(!hasCredentials(), 'No Contracts API credentials configured (set CONTRACTS_* env vars).');

  const res = await client.call(ENDPOINTS.getContracts, { payload: getContractsQuery() });

  const companyMissing =
    res.errorCodes.includes(ErrorCodes.COMPANY_NOT_FOUND) ||
    (res.body?.messages ?? []).some((m) => /company does not exist/i.test(m?.message ?? ''));

  expect(
    companyMissing,
    [
      '',
      '*** CONTRACTS ACCOUNT NOT PROVISIONED ON THIS ENVIRONMENT ***',
      `The API returned ${ErrorCodes.COMPANY_NOT_FOUND} "Company does not exist" for your Client ID.`,
      'Every company-scoped endpoint (GetContracts, GetContractDetails, UploadContract, ...) will',
      'fail until the company is re-provisioned/reactivated for these credentials.',
      'This is an account/environment issue on the API provider side, NOT a defect in this suite.',
      `Probe: HTTP ${res.status}, codes=[${res.errorCodes.join(',')}], messages=${JSON.stringify(res.body?.messages)}`,
      'Action: ask AZM / Contracts support to reactivate the sandbox company (or issue new',
      'credentials), then re-run the workflow. No code change can fix this.',
      '',
    ].join('\n'),
  ).toBe(false);

  // Company exists — confirm the read endpoint actually succeeds before the
  // dependent API suite runs against it.
  expect(
    res.body?.succeeded,
    `GetContracts did not succeed during health check (codes: ${res.errorCodes.join(',')}).`,
  ).toBe(true);
});
