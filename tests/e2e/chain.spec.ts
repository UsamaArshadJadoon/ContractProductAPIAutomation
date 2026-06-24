import { test, expect, requireCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import { uploadContractBody, updateStatusBody } from '../../src/data/payloads.js';
import { uniqueContractNumber } from '../../src/data/testData.js';
import { expectValidEnvelope } from '../helpers/assertions.js';
import type { ApiResponse } from '../../src/client/types.js';

/**
 * End-to-end chained flow (the automatable portion):
 *
 *   UploadContract → GetContractDetails → DownloadUnSignedDocument
 *                  → GetContracts        → UpdateStatus
 *
 * Each step feeds the next. The chain runs in declaration order (serial). With
 * placeholder data the upload may not produce a fully-usable contract; in that
 * case downstream steps still assert valid envelopes against the contract
 * number we attempted, and a clear note is logged. With real seed data the
 * chain becomes a true happy-path.
 *
 * The Nafath signing step (which would unlock DownloadSignedDocument) is a
 * manual human action and is intentionally out of this automated chain — see
 * tests/inbound/signedState.spec.ts.
 */
test.describe.configure({ mode: 'serial' });

test.describe('E2E: contract lifecycle chain', () => {
  requireCredentials();

  const contractNumber = uniqueContractNumber('E2E');
  let uploadSucceeded = false;

  test('1. UploadContract', async ({ client }) => {
    const res = await client.call(ENDPOINTS.uploadContract, {
      payload: uploadContractBody({ contractNumber }),
    });
    expectValidEnvelope(res, 'uploadContract');
    uploadSucceeded = res.status === 200 && res.body?.succeeded === true;
    if (!uploadSucceeded) {
      console.log(
        `[e2e] Upload did not fully succeed with placeholder data (codes: ${res.errorCodes.join(',')}). ` +
          'Downstream steps will still validate envelopes. Provide real sandbox data to exercise the full happy path.',
      );
    }
  });

  test('2. GetContractDetails for the uploaded contract', async ({ client }) => {
    const res = await client.call(ENDPOINTS.getContractDetails, {
      payload: { contractNo: contractNumber },
    });
    expectValidEnvelope(res, 'getContractDetails');
    if (uploadSucceeded) {
      expect(res.body?.succeeded).toBe(true);
      expect(res.body?.data).not.toBeNull();
    }
  });

  test('3. DownloadUnSignedDocument for the uploaded contract', async ({ client }) => {
    const res = await client.call(ENDPOINTS.downloadUnSignedDocument, {
      payload: { contractNo: contractNumber },
    });
    expectValidEnvelope(res, 'downloadUnSignedDocument');
    if (uploadSucceeded) expect(res.body?.succeeded).toBe(true);
  });

  test('4. GetContracts lists contracts (and ideally includes ours)', async ({ client }) => {
    const res: ApiResponse = await client.call(ENDPOINTS.getContracts, {
      payload: { dateFrom: '2025-01-01T00:00:00', dateTo: '2026-12-31T00:00:00', pageSize: 50, pageNumber: 1 },
    });
    expectValidEnvelope(res, 'getContracts');
    expect(res.body?.succeeded).toBe(true);
  });

  test('5. UpdateStatus on the uploaded contract', async ({ client }) => {
    const res = await client.call(ENDPOINTS.updateStatus, {
      payload: updateStatusBody(contractNumber),
    });
    expectValidEnvelope(res, 'updateStatus');
  });
});
