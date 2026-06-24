/**
 * Catalog of all Contracts API endpoints.
 *
 * Single source of truth for path, HTTP method, parameter style, and which
 * base path (inbound `/api` vs entity `/api/v2`) each endpoint lives under.
 * Both the signed client and the data-driven negative tests read from here.
 *
 * Parameter-name quirks captured from the spec's "Calculate Signature" examples
 * (these win over the request tables because the server validates the signed
 * payload):
 *   - DownloadSanadGroup uses `uuId` (not `uuid`).
 *   - GetNafathLoginStatus uses `transId` (not `traceId`).
 *   - SignHashedDocument is documented as GET in its card but is actually POST
 *     with a JSON body (per its signature section + body params).
 */

export type HttpMethod = 'GET' | 'POST';
export type ParamStyle = 'query' | 'body';
export type BaseKind = 'inbound' | 'entity';

export interface EndpointDef {
  /** Stable key used by tests and schema lookup. */
  key: string;
  name: string;
  method: HttpMethod;
  /** Path relative to the base prefix, e.g. "/Contract/UploadContract". */
  path: string;
  base: BaseKind;
  paramStyle: ParamStyle;
  /** Required parameter names (for negative "missing required" tests). */
  required: string[];
  /** True if a valid happy-path needs a Nafath-signed contract (seed data). */
  needsSignedState?: boolean;
}

export const ENDPOINTS = {
  uploadContract: {
    key: 'uploadContract',
    name: 'Upload Contract',
    method: 'POST',
    path: '/Contract/UploadContract',
    base: 'inbound',
    paramStyle: 'body',
    required: ['file', 'contractNumber', 'contractBeneficiaries'],
  },
  uploadContractWithTemplate: {
    key: 'uploadContractWithTemplate',
    name: 'Upload Contract With Template',
    method: 'POST',
    path: '/Contract/UploadContractWithTemplate',
    base: 'inbound',
    paramStyle: 'body',
    required: ['contractNumber', 'contractBeneficiaries'],
  },
  downloadUnSignedDocument: {
    key: 'downloadUnSignedDocument',
    name: 'Download Un-Signed Document',
    method: 'GET',
    path: '/Contract/DownloadUnSignedDocument',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
  },
  downloadSignedDocument: {
    key: 'downloadSignedDocument',
    name: 'Download Signed Document',
    method: 'GET',
    path: '/Contract/DownloadSignedDocument',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
    needsSignedState: true,
  },
  downloadSanad: {
    key: 'downloadSanad',
    name: 'Download Sanad',
    method: 'GET',
    path: '/Contract/DownloadSanad',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
    needsSignedState: true,
  },
  resendApprovalPageUrl: {
    key: 'resendApprovalPageUrl',
    name: 'Resend Approval Page URL',
    method: 'POST',
    path: '/Contract/ResendApprovalPageURL',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNumber'],
  },
  getContractAuditTrail: {
    key: 'getContractAuditTrail',
    name: 'Get Contract Audit Trail',
    method: 'GET',
    path: '/Contract/GetContractAuditTrail',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
  },
  signHashedDocument: {
    key: 'signHashedDocument',
    name: 'Sign Hashed Document',
    method: 'POST',
    path: '/Contract/SignHashedDocument',
    base: 'inbound',
    paramStyle: 'body',
    required: ['hashedDocument', 'contractNumber'],
    needsSignedState: true,
  },
  getContractDetails: {
    key: 'getContractDetails',
    name: 'Get Contract Details',
    method: 'GET',
    path: '/Contract/GetContractDetails',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
  },
  downloadUnSignedAddendum: {
    key: 'downloadUnSignedAddendum',
    name: 'Download Un-Signed Addendum',
    method: 'GET',
    path: '/Contract/DownloadUnSignedAddendum',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
  },
  downloadSignedAddendum: {
    key: 'downloadSignedAddendum',
    name: 'Download Signed Addendum',
    method: 'GET',
    path: '/Contract/DownloadSignedAddendum',
    base: 'inbound',
    paramStyle: 'query',
    required: ['contractNo'],
    needsSignedState: true,
  },
  downloadSanadGroup: {
    key: 'downloadSanadGroup',
    name: 'Download Sanad Group',
    method: 'GET',
    path: '/Contract/DownloadSanadGroup',
    base: 'inbound',
    paramStyle: 'query',
    required: ['uuId'],
    needsSignedState: true,
  },
  getContracts: {
    key: 'getContracts',
    name: 'Get Contracts',
    method: 'GET',
    path: '/Contract/GetContracts',
    base: 'inbound',
    paramStyle: 'query',
    required: [],
  },
  getAllByBeneficiary: {
    key: 'getAllByBeneficiary',
    name: 'Get All By Beneficiary',
    method: 'GET',
    path: '/Contract/GetAllByBeneficiary',
    base: 'inbound',
    paramStyle: 'query',
    required: ['beneficiaryIdNumber'],
  },
  getNafathLoginStatus: {
    key: 'getNafathLoginStatus',
    name: 'Get Nafath Login Status',
    method: 'GET',
    path: '/Contract/GetNafathLoginStatus',
    base: 'inbound',
    paramStyle: 'query',
    required: ['transId'],
    needsSignedState: true,
  },
  getRandomNumber: {
    key: 'getRandomNumber',
    name: 'Get Random Number',
    method: 'GET',
    path: '/Contract/GetRandomNumber',
    base: 'inbound',
    paramStyle: 'query',
    required: ['idNumber', 'contractNumber'],
  },
  updateStatus: {
    key: 'updateStatus',
    name: 'Update Status',
    method: 'POST',
    path: '/Contract/UpdateStatus',
    base: 'inbound',
    paramStyle: 'body',
    required: ['contractNumber', 'statusCode'],
  },
  entityUploadContract: {
    key: 'entityUploadContract',
    name: 'Entity Upload Contract',
    method: 'POST',
    path: '/Entity/Contract/UploadContract',
    base: 'entity',
    paramStyle: 'body',
    required: ['file', 'contractNumber', 'contractBeneficiaries'],
  },
  entityUploadContractWithTemplate: {
    key: 'entityUploadContractWithTemplate',
    name: 'Entity Upload Contract With Template',
    method: 'POST',
    path: '/Entity/Contract/UploadContractWithTemplate',
    base: 'entity',
    paramStyle: 'body',
    required: ['contractNumber', 'contractBeneficiaries'],
  },
} satisfies Record<string, EndpointDef>;

export type EndpointKey = keyof typeof ENDPOINTS;

export const ALL_ENDPOINTS: EndpointDef[] = Object.values(ENDPOINTS);
