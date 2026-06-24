import type { Payload } from '../../src/client/signer.js';
import { ENDPOINTS, type EndpointKey } from '../../src/endpoints/catalog.js';
import { NONEXISTENT } from '../../src/data/testData.js';
import {
  getAllByBeneficiaryQuery,
  getContractsQuery,
  signHashedDocumentBody,
  updateStatusBody,
  uploadContractBody,
  uploadContractWithTemplateBody,
  entityUploadContractBody,
  entityUploadContractWithTemplateBody,
} from '../../src/data/payloads.js';

/**
 * A representative, shape-valid payload for every endpoint. References to data
 * use clearly-nonexistent identifiers, which is sufficient for signature/auth
 * negative tests (the request is well-formed; only auth or the target differs).
 */
export function samplePayloadFor(key: EndpointKey): Payload {
  switch (key) {
    case 'uploadContract':
      return uploadContractBody();
    case 'uploadContractWithTemplate':
      return uploadContractWithTemplateBody();
    case 'entityUploadContract':
      return entityUploadContractBody();
    case 'entityUploadContractWithTemplate':
      return entityUploadContractWithTemplateBody();
    case 'updateStatus':
      return updateStatusBody(NONEXISTENT.contractNumber);
    case 'signHashedDocument':
      return signHashedDocumentBody(NONEXISTENT.contractNumber);
    case 'getContracts':
      return getContractsQuery();
    case 'getAllByBeneficiary':
      return getAllByBeneficiaryQuery(NONEXISTENT.beneficiaryIdNumber);
    case 'getRandomNumber':
      return { idNumber: NONEXISTENT.beneficiaryIdNumber, contractNumber: NONEXISTENT.contractNumber };
    case 'resendApprovalPageUrl':
      return { contractNumber: NONEXISTENT.contractNumber };
    case 'downloadSanadGroup':
      return { uuId: NONEXISTENT.uuId };
    case 'getNafathLoginStatus':
      return { transId: NONEXISTENT.transId };
    case 'downloadUnSignedDocument':
    case 'downloadSignedDocument':
    case 'downloadSanad':
    case 'getContractAuditTrail':
    case 'getContractDetails':
    case 'downloadUnSignedAddendum':
    case 'downloadSignedAddendum':
      return { contractNo: NONEXISTENT.contractNo };
    default:
      return {};
  }
}

export const ALL_KEYS = Object.keys(ENDPOINTS) as EndpointKey[];
