import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Placeholder test data derived from the spec's enum sections and examples.
 *
 * ⚠️ These are PLACEHOLDERS. Uploads may return business validation errors
 * (e.g. Wathq/Nafath checks) until real, valid sandbox values are supplied.
 * Replace via environment variables (see .env.example) or edit here.
 */

const HERE = resolve(fileURLToPath(import.meta.url), '..');
const SAMPLE_PDF = resolve(HERE, '../../fixtures/sample-contract.pdf');

/** Sample contract file as a base64 string (the format the upload APIs expect). */
export function sampleContractBase64(): string {
  return readFileSync(SAMPLE_PDF).toString('base64');
}

/** A pseudo-unique contract number per run so repeated uploads don't collide. */
export function uniqueContractNumber(prefix = 'AUTO'): string {
  const ts = Math.floor(Date.now() / 1000);
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${ts}-${rand}`;
}

/** Enum values referenced by the spec (subset used by tests). */
export const Enums = {
  // §3.2.4 Contract Term, §3.2.18 Beneficiary Type, etc. — representative values.
  beneficiaryRegionId: 1, // §3.2.14 Region
  cityOfIssuanceId: 3, // §3.2.13 City
  cityOfPaymentId: 3,
  lang: 'en', // §3.2.15 Language
  beneficiaryType: 1, // §3.2.18 Beneficiary Type (ContractBeneficiaryType)
  sanadType: 1, // §3.2.9 Sanad Type
  // §3.1 contract status codes used by Update Status
  statusCodeCancelled: 5,
} as const;

/** Default placeholder beneficiary. Override NID/mobile/email with real values. */
export const placeholderBeneficiary = {
  id: 0,
  nameEn: 'John Tester',
  nameAr: 'جون تستر',
  nationalIdNumber: process.env.EXISTING_BENEFICIARY_NID ?? '1000000000',
  mobileNumber: '0500000000',
  email: 'qa.beneficiary@example.com',
  beneficiaryRegionId: Enums.beneficiaryRegionId,
  maximumApprovalMinutes: 60,
  lang: Enums.lang,
  type: Enums.beneficiaryType,
};

/** A clearly-nonexistent identifier for negative "not found" tests. */
export const NONEXISTENT = {
  contractNo: 'NON-EXISTENT-0000000000',
  contractNumber: 'NON-EXISTENT-0000000000',
  beneficiaryIdNumber: '0000000000',
  uuId: '00000000-0000-0000-0000-000000000000',
  transId: '00000000-0000-0000-0000-000000000000',
} as const;
