import { test, requireCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import {
  entityUploadContractBody,
  entityUploadContractWithTemplateBody,
} from '../../src/data/payloads.js';
import { expectStructuredResponse, expectValidEnvelope } from '../helpers/assertions.js';

/**
 * Entity (v2) upload endpoints. These hit the /api/v2 base path and include the
 * entity-specific fields (unifiedNumber, wathqVerify, contractEntity).
 */
test.describe('Entity (v2): upload endpoints', () => {
  requireCredentials();

  test('Entity/UploadContract accepts a well-formed request', async ({ client }) => {
    const res = await client.call(ENDPOINTS.entityUploadContract, {
      payload: entityUploadContractBody(),
    });
    expectStructuredResponse(res, 'entityUploadContract');
  });

  test('Entity/UploadContractWithTemplate accepts a well-formed request', async ({ client }) => {
    const res = await client.call(ENDPOINTS.entityUploadContractWithTemplate, {
      payload: entityUploadContractWithTemplateBody(),
    });
    expectStructuredResponse(res, 'entityUploadContractWithTemplate');
  });

  test('Entity/UploadContract uses the /api/v2 base path', async ({ client }) => {
    const url = client.buildUrl(ENDPOINTS.entityUploadContract, {});
    test.expect(url).toContain('/api/v2/Entity/Contract/UploadContract');
  });

  test('Entity/UploadContract with missing file returns a valid envelope', async ({ client }) => {
    const body = entityUploadContractBody();
    delete (body as Record<string, unknown>).file;
    const res = await client.call(ENDPOINTS.entityUploadContract, { payload: body });
    expectValidEnvelope(res, 'entityUploadContract');
  });
});
