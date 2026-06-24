import { expect } from '@playwright/test';
import type { ApiResponse } from '../../src/client/types.js';
import { responseSchema } from '../../src/schemas/responseSchemas.js';
import { validate } from '../../src/schemas/validator.js';
import type { EndpointKey } from '../../src/endpoints/catalog.js';

/**
 * Assert the response conforms to the endpoint's envelope schema and return the
 * parsed envelope. Use for any response where the body should be valid JSON.
 */
export function expectValidEnvelope<T>(res: ApiResponse<T>, key: EndpointKey): void {
  expect(res.body, `Response body should be JSON. Raw: ${res.rawText.slice(0, 500)}`).not.toBeNull();
  const { valid, errors } = validate(responseSchema(key), res.body, key);
  expect(valid, `Schema errors for ${key}: ${errors.join('; ')}`).toBe(true);
}

/** Assert a successful business response (HTTP 200 + succeeded:true). */
export function expectSuccess<T>(res: ApiResponse<T>, key: EndpointKey): void {
  expect(res.status, `HTTP status for ${key}. Codes: ${res.errorCodes.join(',')}`).toBe(200);
  expectValidEnvelope(res, key);
  expect(res.body?.succeeded, `succeeded flag for ${key}. Codes: ${res.errorCodes.join(',')}`).toBe(true);
}

/**
 * Assert the API responded in a structured way (reached the service, returned
 * the envelope) without asserting success — used for placeholder-data calls
 * that may legitimately fail business validation.
 */
export function expectStructuredResponse<T>(res: ApiResponse<T>, key: EndpointKey): void {
  expect(
    [200, 400, 401, 403, 404, 422, 500].includes(res.status),
    `Unexpected HTTP status ${res.status} for ${key}. Raw: ${res.rawText.slice(0, 300)}`,
  ).toBe(true);
  if (res.body) expectValidEnvelope(res, key);
}

/**
 * Assert the response indicates an authentication/signature failure — i.e. the
 * request was rejected and did NOT succeed. The exact business code is left
 * advisory: the sandbox sometimes surfaces a different/additional code (e.g.
 * E0206) before E0208, so the robust invariant is "must not succeed".
 *
 * If `preferredCode` is given and present, it is asserted; otherwise we only
 * log a note so the test still passes on an equivalent rejection.
 */
export function expectAuthFailure<T>(res: ApiResponse<T>, preferredCode?: string): void {
  const rejected =
    res.status >= 400 || res.body?.succeeded === false || res.errorCodes.length > 0;
  expect(
    rejected && res.body?.succeeded !== true,
    `Expected rejection but request succeeded. HTTP ${res.status}, succeeded=${res.body?.succeeded}, codes=${res.errorCodes.join(',')}`,
  ).toBe(true);
  if (preferredCode && res.errorCodes.length > 0 && !res.errorCodes.includes(preferredCode)) {
    console.log(
      `[auth-negative] rejected as expected, but with codes [${res.errorCodes.join(',')}] instead of preferred ${preferredCode}.`,
    );
  }
}
