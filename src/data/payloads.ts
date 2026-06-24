import type { Payload } from '../client/signer.js';
import { Enums, placeholderBeneficiary, sampleContractBase64, uniqueContractNumber } from './testData.js';

/**
 * Request payload builders. Each returns a plain object whose key order matches
 * the spec's "Calculate Signature" examples (order is part of the signature).
 */

export interface UploadOverrides {
  contractNumber?: string;
  file?: string;
  description?: string;
}

/** §2.1.1 Upload Contract — minimal valid-shaped body (no sanad). */
export function uploadContractBody(overrides: UploadOverrides = {}): Payload {
  return {
    file: overrides.file ?? sampleContractBase64(),
    contractNumber: overrides.contractNumber ?? uniqueContractNumber(),
    description: overrides.description ?? 'Automated test contract',
    contractBeneficiaries: [{ ...placeholderBeneficiary }],
  };
}

/** §2.1.2 Upload Contract With Template. */
export function uploadContractWithTemplateBody(overrides: UploadOverrides = {}): Payload {
  return {
    contractNumber: overrides.contractNumber ?? uniqueContractNumber('AUTO-TPL'),
    description: overrides.description ?? 'Automated test contract (template)',
    contractBeneficiaries: [{ ...placeholderBeneficiary }],
  };
}

/** §2.2.1 Entity Upload Contract — adds entity-specific fields. */
export function entityUploadContractBody(overrides: UploadOverrides = {}): Payload {
  return {
    file: overrides.file ?? sampleContractBase64(),
    contractNumber: overrides.contractNumber ?? uniqueContractNumber('AUTO-ENT'),
    description: overrides.description ?? 'Automated entity test contract',
    contractBeneficiaries: [{ ...placeholderBeneficiary }],
    unifiedNumber: '7000000000',
    wathqVerify: false,
    contractEntity: {
      name: 'Sample Single-Owner Entity',
      issueDate: '2025-01-01T00:00:00',
    },
  };
}

/** §2.2.2 Entity Upload Contract With Template. */
export function entityUploadContractWithTemplateBody(overrides: UploadOverrides = {}): Payload {
  return {
    contractNumber: overrides.contractNumber ?? uniqueContractNumber('AUTO-ENT-TPL'),
    description: overrides.description ?? 'Automated entity template contract',
    contractBeneficiaries: [{ ...placeholderBeneficiary }],
    unifiedNumber: '7000000000',
    wathqVerify: false,
    contractEntity: {
      name: 'Sample Single-Owner Entity',
      issueDate: '2025-01-01T00:00:00',
    },
  };
}

/** §2.1.17 Update Status body. */
export function updateStatusBody(contractNumber: string, statusCode = Enums.statusCodeCancelled): Payload {
  return {
    contractNumber,
    statusCode,
  };
}

/** §2.1.8 Sign Hashed Document body. */
export function signHashedDocumentBody(contractNumber: string, hashedDocument = '<SignReq/>'): Payload {
  return {
    hashedDocument,
    contractNumber,
  };
}

/** §2.1.13 Get Contracts query object. */
export function getContractsQuery(opts: { pageSize?: number; pageNumber?: number } = {}): Payload {
  return {
    dateFrom: '2025-01-01T00:00:00',
    dateTo: '2026-12-31T00:00:00',
    pageSize: opts.pageSize ?? 5,
    pageNumber: opts.pageNumber ?? 1,
  };
}

/** §2.1.14 Get All By Beneficiary query object. */
export function getAllByBeneficiaryQuery(beneficiaryIdNumber: string): Payload {
  return {
    beneficiaryIdNumber,
    dateFrom: '2025-01-01T00:00:00',
    dateTo: '2026-12-31T00:00:00',
    pageSize: 5,
    pageNumber: 1,
  };
}
