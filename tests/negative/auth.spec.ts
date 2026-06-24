import { test, expect, requireCredentials } from '../fixtures.js';
import { ENDPOINTS, type EndpointKey } from '../../src/endpoints/catalog.js';
import { ErrorCodes } from '../../src/client/types.js';
import { samplePayloadFor, ALL_KEYS } from '../helpers/samplePayloads.js';
import { expectAuthFailure } from '../helpers/assertions.js';

/**
 * Authentication negative tests, data-driven across every endpoint.
 * These do not need any seeded/signed contract data — they assert that the
 * service rejects tampered signatures and bad API keys.
 */
test.describe('Auth negatives (all endpoints)', () => {
  requireCredentials();

  for (const key of ALL_KEYS) {
    const endpoint = ENDPOINTS[key as EndpointKey];

    test(`${endpoint.name} @ rejects a tampered signature`, async ({ client }) => {
      const res = await client.call(endpoint, {
        payload: samplePayloadFor(key as EndpointKey),
        overrideSignature: 'this-is-not-a-valid-signature',
      });
      expectAuthFailure(res, ErrorCodes.INVALID_SIGNATURE);
    });

    test(`${endpoint.name} @ rejects an invalid API key`, async ({ client }) => {
      const res = await client.call(endpoint, {
        payload: samplePayloadFor(key as EndpointKey),
        headerOverrides: { 'X-Contracts-APIKey': 'invalid-api-key-000' },
      });
      expectAuthFailure(res);
    });

    test(`${endpoint.name} @ rejects a missing client id`, async ({ client }) => {
      const res = await client.call(endpoint, {
        payload: samplePayloadFor(key as EndpointKey),
        headerOverrides: { 'X-Contracts-ClientId': '' },
      });
      expectAuthFailure(res);
    });
  }
});

test.describe('Signature smoke (validates the signing scheme end-to-end)', () => {
  requireCredentials();

  // GetRandomNumber is a lightweight signed GET. A correctly-signed request must
  // NOT return E0208 (Invalid Signature) — if it does, the signing scheme in
  // src/client/signer.ts needs tuning for this sandbox.
  test('a correctly-signed request is not rejected as E0208 @smoke', async ({ client }) => {
    const res = await client.call(ENDPOINTS.getRandomNumber, {
      payload: samplePayloadFor('getRandomNumber'),
    });
    expect(
      res.errorCodes.includes(ErrorCodes.INVALID_SIGNATURE),
      `Signing scheme rejected by sandbox (E0208). Message: ${res.rawText.slice(0, 300)}`,
    ).toBe(false);
  });
});
