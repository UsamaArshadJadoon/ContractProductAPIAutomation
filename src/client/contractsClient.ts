import type { APIRequestContext, APIResponse as PWResponse } from '@playwright/test';
import {
  getCredentials,
  getEnvConfig,
  type ContractsEnvConfig,
  type Credentials,
} from './config.js';
import { nowTimestamp, sign, stripNulls, type Payload } from './signer.js';
import type { ApiResponse } from './types.js';
import type { EndpointDef } from '../endpoints/catalog.js';

export interface CallOptions {
  /** Override the payload (body for POST, query object for GET). */
  payload?: Payload;
  /** Force a specific timestamp (used by signer/replay tests). */
  timestamp?: string;
  /** Replace the computed signature (used by bad-signature negative tests). */
  overrideSignature?: string;
  /** Override individual headers (e.g. wrong API key for negative tests). */
  headerOverrides?: Record<string, string>;
  /** Override credentials (e.g. empty/invalid for negative tests). */
  credentials?: Partial<Credentials>;
}

/**
 * Build the query string from a payload, preserving key insertion order and
 * dropping null/undefined. Mirrors the data used to compute the signature.
 */
function buildQueryString(payload: Payload): string {
  const cleaned = stripNulls(payload) as Record<string, unknown>;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(cleaned)) {
    if (Array.isArray(v)) {
      for (const item of v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(item))}`);
    } else if (v !== null && v !== undefined && typeof v !== 'object') {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join('&');
}

export class ContractsClient {
  private readonly request: APIRequestContext;
  private readonly env: ContractsEnvConfig;
  private readonly creds: Credentials;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.env = getEnvConfig();
    this.creds = getCredentials();
  }

  /** Full request path including the base prefix (part of the signature). */
  endpointPath(endpoint: EndpointDef): string {
    const base = endpoint.base === 'entity' ? this.env.entityBasePath : this.env.inboundBasePath;
    return `${base}${endpoint.path}`;
  }

  /** Absolute URL for an endpoint (query string appended for GET requests). */
  buildUrl(endpoint: EndpointDef, payload: Payload): string {
    const path = this.endpointPath(endpoint);
    let url = `${this.env.origin}${path}`;
    if (endpoint.method === 'GET') {
      const qs = buildQueryString(payload);
      if (qs) url += `?${qs}`;
    }
    return url;
  }

  async call<TData = unknown>(
    endpoint: EndpointDef,
    options: CallOptions = {},
  ): Promise<ApiResponse<TData>> {
    const payload = options.payload ?? {};
    const timestamp = options.timestamp ?? nowTimestamp();
    const creds: Credentials = { ...this.creds, ...options.credentials };
    const cleaned = stripNulls(payload) as Payload;

    const { signature, serializedData } = sign({
      method: endpoint.method,
      host: this.env.host,
      endpointPath: this.endpointPath(endpoint),
      timestamp,
      secretKey: creds.secretKey,
      data: cleaned,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Contracts-Timestamp': timestamp,
      'X-Contracts-ClientId': creds.clientId,
      'X-Contracts-APIKey': creds.apiKey,
      'X-Contracts-Signature': options.overrideSignature ?? signature,
      ...options.headerOverrides,
    };

    const url = this.buildUrl(endpoint, payload);

    let res: PWResponse;
    if (endpoint.method === 'GET') {
      res = await this.request.get(url, { headers });
    } else {
      // Send the EXACT serialized bytes we signed, not a re-serialized object.
      res = await this.request.post(url, { headers, data: serializedData });
    }

    return this.parse<TData>(res);
  }

  private async parse<TData>(res: PWResponse): Promise<ApiResponse<TData>> {
    const status = res.status();
    const rawText = await res.text();
    let body: ApiResponse<TData>['body'] = null;
    try {
      body = rawText ? JSON.parse(rawText) : null;
    } catch {
      body = null;
    }
    const errorCodes = (body?.messages ?? [])
      .map((m) => m.errorCode)
      .filter((c): c is string => Boolean(c));
    return { status, ok: res.ok(), body, rawText, errorCodes };
  }
}
