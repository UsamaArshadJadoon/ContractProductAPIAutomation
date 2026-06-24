import { test, requireCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import { uploadContractBody, uploadContractWithTemplateBody, updateStatusBody } from '../../src/data/payloads.js';
import { expectStructuredResponse, expectValidEnvelope } from '../helpers/assertions.js';

/**
 * Upload endpoints. With placeholder beneficiary data these may return business
 * validation errors (e.g. invalid national id / Nafath checks), so we assert a
 * well-formed structured response. Once real sandbox data is configured, the
 * E2E chain (tests/e2e) exercises the full happy path and captures IDs.
 */
test.describe('Inbound: upload endpoints', () => {
  requireCredentials();

  test('UploadContract accepts a well-formed request', async ({ client }) => {
    const res = await client.call(ENDPOINTS.uploadContract, { payload: uploadContractBody() });
    expectStructuredResponse(res, 'uploadContract');
  });

  test('UploadContractWithTemplate accepts a well-formed request', async ({ client }) => {
    const res = await client.call(ENDPOINTS.uploadContractWithTemplate, {
      payload: uploadContractWithTemplateBody(),
    });
    expectStructuredResponse(res, 'uploadContractWithTemplate');
  });

  test('UpdateStatus returns a valid envelope', async ({ client, seed }) => {
    const contractNumber = seed.existingContractNumber ?? 'NON-EXISTENT-0000000000';
    const res = await client.call(ENDPOINTS.updateStatus, { payload: updateStatusBody(contractNumber) });
    expectStructuredResponse(res, 'updateStatus');
  });

  test('UploadContract with a missing required field is rejected', async ({ client }) => {
    const body = uploadContractBody();
    delete (body as Record<string, unknown>).contractNumber;
    const res = await client.call(ENDPOINTS.uploadContract, { payload: body });
    expectValidEnvelope(res, 'uploadContract');
  });
});
