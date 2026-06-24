import type { AnySchema } from 'ajv';
import type { EndpointKey } from '../endpoints/catalog.js';

/**
 * Response schemas for every endpoint, derived from the spec's Response Element
 * tables. Each endpoint shares the common envelope; only `data` differs.
 *
 * Schemas are lenient about additional properties (forward-compatible) but
 * enforce the envelope contract and the types of documented `data` fields.
 */

/** Wrap a `data` schema in the standard API envelope. */
export function envelope(dataSchema: AnySchema): AnySchema {
  return {
    type: 'object',
    required: ['httpCode', 'succeeded'],
    properties: {
      data: { anyOf: [dataSchema as object, { type: 'null' }] },
      xmlData: { type: ['string', 'null'] },
      httpCode: { type: 'integer' },
      messages: {
        anyOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                errorCode: { type: ['string', 'null'] },
                message: { type: ['string', 'null'] },
              },
            },
          },
          { type: 'null' },
        ],
      },
      succeeded: { type: 'boolean' },
    },
  };
}

const obj = (properties: Record<string, AnySchema>): AnySchema => ({
  type: 'object',
  additionalProperties: true,
  properties: properties as Record<string, object>,
});

const str = { type: ['string', 'null'] } as const;
const num = { type: ['number', 'null'] } as const;
const strArr = { type: ['array', 'null'], items: { type: 'string' } } as const;

const beneficiaryListItem = obj({
  beneficiaryIdNumber: str,
  beneficiaryName: str,
  fileStatus: str,
  fileStatusId: str,
  actionDate: str,
});

const contractDetailObj = obj({
  customerCR: str,
  contractNumber: str,
  beneficiaryIDNumbers: strArr,
  contractBeneficiariesList: { type: ['array', 'null'], items: beneficiaryListItem },
  contractStatusCode: str,
  createdOn: str,
  signDate: str,
  unSignFile: str,
  signFile: str,
  fileSharingLink: { anyOf: [strArr, str] },
  unSignFileLink: str,
});

const sanadGroupObj = obj({
  sanadGroup: obj({
    id: str,
    referenceId: str,
    status: str,
    issuedAt: str,
    approvedAt: str,
    sanad: {
      type: ['array', 'null'],
      items: obj({
        id: str,
        totalValue: num,
        referenceId: str,
        number: str,
        createdAt: str,
        updatedAt: str,
        dueDate: str,
        dueType: str,
        status: str,
      }),
    },
  }),
});

const fileVersionObj = obj({ file: str, version: str });

const DATA_SCHEMAS: Record<EndpointKey, AnySchema> = {
  uploadContract: obj({
    contractId: num,
    contractNumber: str,
    contractStatusCode: str,
    createdOn: str,
    fileSharingLink: { anyOf: [strArr, str] },
    unSignFileLink: str,
  }),
  uploadContractWithTemplate: obj({
    contractId: num,
    contractNumber: str,
    contractStatusCode: str,
    createdOn: str,
    fileSharingLink: { anyOf: [strArr, str] },
    unSignFileLink: str,
  }),
  downloadUnSignedDocument: fileVersionObj,
  downloadSignedDocument: fileVersionObj,
  downloadSanad: obj({}),
  resendApprovalPageUrl: obj({ isSent: { type: ['boolean', 'null'] } }),
  getContractAuditTrail: obj({ reportFile: str }),
  signHashedDocument: obj({ document: str }),
  getContractDetails: contractDetailObj,
  downloadUnSignedAddendum: fileVersionObj,
  downloadSignedAddendum: fileVersionObj,
  downloadSanadGroup: sanadGroupObj,
  getContracts: obj({
    result: { type: ['array', 'null'], items: contractDetailObj },
    allItemCount: num,
  }),
  getAllByBeneficiary: obj({
    result: { type: ['array', 'null'], items: contractDetailObj },
    allItemCount: num,
  }),
  getNafathLoginStatus: obj({ authorizationStatus: str }),
  getRandomNumber: obj({
    transId: str,
    random: str,
    status: str,
    message: str,
    trace: str,
  }),
  updateStatus: contractDetailObj,
  entityUploadContract: obj({
    contractId: num,
    contractNumber: str,
    contractStatusCode: str,
    createdOn: str,
  }),
  entityUploadContractWithTemplate: obj({
    contractId: num,
    contractNumber: str,
    contractStatusCode: str,
    createdOn: str,
  }),
};

/** Full envelope schema for an endpoint's response. */
export function responseSchema(key: EndpointKey): AnySchema {
  return envelope(DATA_SCHEMAS[key]);
}
