import { createHmac } from 'node:crypto';

/**
 * HMAC-SHA256 request signing for the Contracts API.
 *
 * Reproduces the scheme defined in the Integration Specification Document:
 *
 *   encoded_data = base64( utf8( data ) )
 *   message      = `${METHOD}\n${host}\n${endpointPath}\nt=${timestamp}&ed=${encoded_data}`
 *   signature    = base64( HMAC_SHA256(secretKey, message) )
 *
 * Where `data` is the JSON representation of the request payload:
 *   - for POST endpoints: the request body object
 *   - for GET endpoints:  the query-parameter object
 *
 * Important rules from the spec:
 *   - METHOD is upper-case (GET/POST).
 *   - `host` is the bare host (no scheme, no path), e.g. "api-sb.contracts.com.sa".
 *   - `endpointPath` includes the base prefix, e.g. "/api/Contract/UploadContract"
 *     or "/api/v2/Entity/Contract/UploadContract".
 *   - Field ORDER matters and is preserved from the payload object's insertion order.
 *   - NULL / undefined values MUST be removed from `data` before signing (and from
 *     what is actually sent), even though the raw JSON body may contain nulls.
 *
 * NOTE: The exact JSON serialization (compact vs. spaced) is not nailed down by
 * the spec, and the server recomputes the signature from what it receives. This
 * module serializes `data` with `JSON.stringify` (compact, key order preserved)
 * and the client sends those exact bytes. If the sandbox rejects signatures with
 * E0208 (Invalid Signature), tune `serializeData` here — it is the single source
 * of truth for both the signed bytes and the wire bytes.
 */

export type Payload = Record<string, unknown>;

export interface SignatureInput {
  method: string;
  host: string;
  /** Full request path including the /api (or /api/v2) prefix. */
  endpointPath: string;
  /** Unix timestamp in seconds, as a string. */
  timestamp: string;
  secretKey: string;
  /** The payload object (body for POST, query object for GET). May be empty. */
  data?: Payload;
}

export interface SignatureResult {
  signature: string;
  /** The exact serialized `data` string that was signed (and should be sent). */
  serializedData: string;
  encodedData: string;
  message: string;
  timestamp: string;
}

/**
 * Recursively strip null/undefined values, preserving key insertion order.
 * Empty objects/arrays are preserved (they are valid, intentional values).
 */
export function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== null && v !== undefined)
      .map((v) => stripNulls(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === null || v === undefined) continue;
      out[k] = stripNulls(v);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Serialize the payload into the canonical string that is both signed and sent.
 * Compact JSON, key order preserved, nulls already stripped by the caller.
 */
export function serializeData(data: Payload): string {
  return JSON.stringify(data);
}

export function buildMessage(input: Omit<SignatureInput, 'secretKey'>): {
  message: string;
  serializedData: string;
  encodedData: string;
} {
  const cleaned = stripNulls(input.data ?? {});
  const serializedData = serializeData(cleaned);
  const encodedData = Buffer.from(serializedData, 'utf-8').toString('base64');
  const method = input.method.toUpperCase();
  const message = `${method}\n${input.host}\n${input.endpointPath}\nt=${input.timestamp}&ed=${encodedData}`;
  return { message, serializedData, encodedData };
}

export function sign(input: SignatureInput): SignatureResult {
  const { message, serializedData, encodedData } = buildMessage(input);
  const signature = createHmac('sha256', input.secretKey)
    .update(message, 'utf-8')
    .digest('base64');
  return { signature, serializedData, encodedData, message, timestamp: input.timestamp };
}

/** Current Unix timestamp in seconds, as a string (the format the API expects). */
export function nowTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}
