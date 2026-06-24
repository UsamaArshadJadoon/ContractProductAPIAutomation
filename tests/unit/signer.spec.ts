import { test, expect } from '@playwright/test';
import { buildMessage, sign, stripNulls, serializeData, nowTimestamp } from '../../src/client/signer.js';

/**
 * Offline, deterministic unit tests for the HMAC signer. No network.
 * These lock the message-construction format and signing algorithm.
 */

test.describe('signer.stripNulls', () => {
  test('removes null/undefined and preserves key order', () => {
    const input = { a: 1, b: null, c: 'x', d: undefined, e: 2 };
    expect(stripNulls(input)).toEqual({ a: 1, c: 'x', e: 2 });
    expect(Object.keys(stripNulls(input))).toEqual(['a', 'c', 'e']);
  });

  test('recurses into nested objects and arrays', () => {
    const input = { outer: { keep: 1, drop: null }, list: [{ k: 1, n: null }, null, 2] };
    expect(stripNulls(input)).toEqual({ outer: { keep: 1 }, list: [{ k: 1 }, 2] });
  });

  test('preserves intentional empty objects and arrays', () => {
    expect(stripNulls({ a: {}, b: [] })).toEqual({ a: {}, b: [] });
  });
});

test.describe('signer.buildMessage', () => {
  test('produces the documented message format with newline separators', () => {
    const { message, encodedData, serializedData } = buildMessage({
      method: 'GET',
      host: 'api-sb.contracts.com.sa',
      endpointPath: '/api/Contract/GetContractDetails',
      timestamp: '1586345122',
      data: { contractNo: '10002000' },
    });
    expect(serializedData).toBe('{"contractNo":"10002000"}');
    expect(encodedData).toBe('eyJjb250cmFjdE5vIjoiMTAwMDIwMDAifQ==');
    expect(message).toBe(
      'GET\napi-sb.contracts.com.sa\n/api/Contract/GetContractDetails\nt=1586345122&ed=eyJjb250cmFjdE5vIjoiMTAwMDIwMDAifQ==',
    );
  });

  test('upper-cases the HTTP method', () => {
    const { message } = buildMessage({
      method: 'post',
      host: 'h',
      endpointPath: '/p',
      timestamp: '1',
      data: {},
    });
    expect(message.startsWith('POST\n')).toBe(true);
  });

  test('strips nulls before encoding', () => {
    const { serializedData } = buildMessage({
      method: 'GET',
      host: 'h',
      endpointPath: '/p',
      timestamp: '1',
      data: { a: 'keep', b: null },
    });
    expect(serializedData).toBe('{"a":"keep"}');
  });
});

test.describe('signer.sign', () => {
  test('matches the precomputed golden HMAC-SHA256 signature', () => {
    const result = sign({
      method: 'GET',
      host: 'api-sb.contracts.com.sa',
      endpointPath: '/api/Contract/GetContractDetails',
      timestamp: '1586345122',
      secretKey: 'test_secret_key',
      data: { contractNo: '10002000' },
    });
    expect(result.signature).toBe('wvd9jC8jRlW6wzDawzLhN9I2MJiKy8D95l/ApCGy22o=');
  });

  test('is deterministic for the same inputs', () => {
    const args = {
      method: 'POST' as const,
      host: 'api-sb.contracts.com.sa',
      endpointPath: '/api/Contract/UpdateStatus',
      timestamp: '1700000000',
      secretKey: 's3cr3t',
      data: { contractNumber: 'X', statusCode: 5 },
    };
    expect(sign(args).signature).toBe(sign(args).signature);
  });

  test('different secret keys yield different signatures', () => {
    const base = {
      method: 'GET' as const,
      host: 'h',
      endpointPath: '/p',
      timestamp: '1',
      data: { a: 1 },
    };
    expect(sign({ ...base, secretKey: 'k1' }).signature).not.toBe(
      sign({ ...base, secretKey: 'k2' }).signature,
    );
  });
});

test.describe('signer helpers', () => {
  test('serializeData yields compact JSON', () => {
    expect(serializeData({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
  });

  test('nowTimestamp returns unix seconds as a numeric string', () => {
    const ts = nowTimestamp();
    expect(ts).toMatch(/^\d{10}$/);
  });
});
