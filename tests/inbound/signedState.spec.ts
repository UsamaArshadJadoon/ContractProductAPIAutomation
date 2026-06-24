import { test, requireCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import { signHashedDocumentBody } from '../../src/data/payloads.js';
import { NONEXISTENT } from '../../src/data/testData.js';
import { expectSuccess, expectStructuredResponse, expectValidEnvelope } from '../helpers/assertions.js';

/**
 * Endpoints that require a Nafath-signed contract / addendum / sanad to reach a
 * valid happy-path. Signing needs a human, so:
 *   - negative paths (nonexistent target) ALWAYS run and assert a valid envelope;
 *   - happy paths run ONLY when seed data is supplied via env, else they skip
 *     with an explicit reason (keeps CI green and honest).
 */
test.describe('Inbound: signed-state endpoints', () => {
  requireCredentials();

  test('DownloadSignedDocument', async ({ client, seed }) => {
    test.skip(!seed.signedContractNumber, 'Set SIGNED_CONTRACT_NUMBER to run the happy path.');
    const res = await client.call(ENDPOINTS.downloadSignedDocument, {
      payload: { contractNo: seed.signedContractNumber! },
    });
    expectSuccess(res, 'downloadSignedDocument');
  });

  test('DownloadSignedDocument (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.downloadSignedDocument, {
      payload: { contractNo: NONEXISTENT.contractNo },
    });
    expectStructuredResponse(res, 'downloadSignedDocument');
  });

  test('DownloadSignedAddendum', async ({ client, seed }) => {
    test.skip(!seed.signedContractNumber, 'Set SIGNED_CONTRACT_NUMBER to run the happy path.');
    const res = await client.call(ENDPOINTS.downloadSignedAddendum, {
      payload: { contractNo: seed.signedContractNumber!, refNumber: seed.signedAddendumRef },
    });
    expectSuccess(res, 'downloadSignedAddendum');
  });

  test('DownloadSignedAddendum (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.downloadSignedAddendum, {
      payload: { contractNo: NONEXISTENT.contractNo },
    });
    expectStructuredResponse(res, 'downloadSignedAddendum');
  });

  test('DownloadSanad', async ({ client, seed }) => {
    test.skip(!seed.signedContractNumber, 'Set SIGNED_CONTRACT_NUMBER to run the happy path.');
    const res = await client.call(ENDPOINTS.downloadSanad, {
      payload: { contractNo: seed.signedContractNumber! },
    });
    expectSuccess(res, 'downloadSanad');
  });

  test('DownloadSanad (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.downloadSanad, {
      payload: { contractNo: NONEXISTENT.contractNo },
    });
    expectStructuredResponse(res, 'downloadSanad');
  });

  test('DownloadSanadGroup', async ({ client, seed }) => {
    test.skip(!seed.sanadGroupUuid, 'Set SANAD_GROUP_UUID to run the happy path.');
    const res = await client.call(ENDPOINTS.downloadSanadGroup, {
      payload: { uuId: seed.sanadGroupUuid! },
    });
    expectSuccess(res, 'downloadSanadGroup');
  });

  test('DownloadSanadGroup (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.downloadSanadGroup, {
      payload: { uuId: NONEXISTENT.uuId },
    });
    expectStructuredResponse(res, 'downloadSanadGroup');
  });

  test('GetNafathLoginStatus', async ({ client, seed }) => {
    test.skip(!seed.nafathTraceId, 'Set NAFATH_TRACE_ID to run the happy path.');
    const res = await client.call(ENDPOINTS.getNafathLoginStatus, {
      payload: { transId: seed.nafathTraceId! },
    });
    expectSuccess(res, 'getNafathLoginStatus');
  });

  test('GetNafathLoginStatus (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.getNafathLoginStatus, {
      payload: { transId: NONEXISTENT.transId },
    });
    expectStructuredResponse(res, 'getNafathLoginStatus');
  });

  test('SignHashedDocument', async ({ client, seed }) => {
    test.skip(!seed.signedContractNumber, 'Set SIGNED_CONTRACT_NUMBER to run the happy path.');
    const res = await client.call(ENDPOINTS.signHashedDocument, {
      payload: signHashedDocumentBody(seed.signedContractNumber!),
    });
    expectStructuredResponse(res, 'signHashedDocument');
  });

  test('SignHashedDocument (nonexistent) returns a valid envelope', async ({ client }) => {
    const res = await client.call(ENDPOINTS.signHashedDocument, {
      payload: signHashedDocumentBody(NONEXISTENT.contractNumber),
    });
    expectValidEnvelope(res, 'signHashedDocument');
  });
});
