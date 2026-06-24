import { test, requireCredentials } from '../fixtures.js';
import { ENDPOINTS } from '../../src/endpoints/catalog.js';
import {
  getAllByBeneficiaryQuery,
  getContractsQuery,
} from '../../src/data/payloads.js';
import { NONEXISTENT } from '../../src/data/testData.js';
import { expectSuccess, expectStructuredResponse, expectValidEnvelope } from '../helpers/assertions.js';

/**
 * Read/query endpoints. `GetContracts` is a clean happy-path (no required
 * params, returns the company's contracts list). The rest depend on existing
 * data, so they assert a well-formed structured response and upgrade to a full
 * success assertion when seed data is supplied via env.
 */
test.describe('Inbound: read endpoints', () => {
  requireCredentials();

  test('GetContracts returns a valid paginated list @smoke', async ({ client }) => {
    const res = await client.call(ENDPOINTS.getContracts, { payload: getContractsQuery() });
    expectSuccess(res, 'getContracts');
  });

  test('GetAllByBeneficiary returns a valid envelope', async ({ client, seed }) => {
    const nid = seed.existingBeneficiaryNid ?? NONEXISTENT.beneficiaryIdNumber;
    const res = await client.call(ENDPOINTS.getAllByBeneficiary, {
      payload: getAllByBeneficiaryQuery(nid),
    });
    if (seed.existingBeneficiaryNid) expectSuccess(res, 'getAllByBeneficiary');
    else expectStructuredResponse(res, 'getAllByBeneficiary');
  });

  test('GetContractDetails returns a valid envelope', async ({ client, seed }) => {
    const contractNo = seed.existingContractNumber ?? NONEXISTENT.contractNo;
    const res = await client.call(ENDPOINTS.getContractDetails, { payload: { contractNo } });
    if (seed.existingContractNumber) expectSuccess(res, 'getContractDetails');
    else expectStructuredResponse(res, 'getContractDetails');
  });

  test('GetContractAuditTrail returns a valid envelope', async ({ client, seed }) => {
    const contractNo = seed.existingContractNumber ?? NONEXISTENT.contractNo;
    const res = await client.call(ENDPOINTS.getContractAuditTrail, { payload: { contractNo } });
    expectStructuredResponse(res, 'getContractAuditTrail');
  });

  test('GetRandomNumber returns a valid envelope', async ({ client, seed }) => {
    const res = await client.call(ENDPOINTS.getRandomNumber, {
      payload: {
        idNumber: seed.existingBeneficiaryNid ?? NONEXISTENT.beneficiaryIdNumber,
        contractNumber: seed.existingContractNumber ?? NONEXISTENT.contractNumber,
      },
    });
    expectStructuredResponse(res, 'getRandomNumber');
  });

  test('DownloadUnSignedDocument returns a valid envelope', async ({ client, seed }) => {
    const contractNo = seed.existingContractNumber ?? NONEXISTENT.contractNo;
    const res = await client.call(ENDPOINTS.downloadUnSignedDocument, { payload: { contractNo } });
    expectStructuredResponse(res, 'downloadUnSignedDocument');
  });

  test('DownloadUnSignedAddendum returns a valid envelope', async ({ client, seed }) => {
    const contractNo = seed.existingContractNumber ?? NONEXISTENT.contractNo;
    const res = await client.call(ENDPOINTS.downloadUnSignedAddendum, { payload: { contractNo } });
    expectStructuredResponse(res, 'downloadUnSignedAddendum');
  });

  test('ResendApprovalPageURL returns a valid envelope', async ({ client, seed }) => {
    const contractNumber = seed.existingContractNumber ?? NONEXISTENT.contractNumber;
    const res = await client.call(ENDPOINTS.resendApprovalPageUrl, { payload: { contractNumber } });
    expectStructuredResponse(res, 'resendApprovalPageUrl');
  });

  test('GetContractDetails for a nonexistent contract fails gracefully', async ({ client }) => {
    const res = await client.call(ENDPOINTS.getContractDetails, {
      payload: { contractNo: NONEXISTENT.contractNo },
    });
    expectValidEnvelope(res, 'getContractDetails');
  });
});
