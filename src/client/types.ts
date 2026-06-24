/**
 * Shared response types for the Contracts API.
 *
 * Every endpoint returns the same envelope: a `data` object (shape varies per
 * endpoint), plus `xmlData`, `httpCode`, `messages[]`, and `succeeded`.
 */

export interface ApiMessage {
  errorCode: string | null;
  message: string | null;
}

export interface ApiEnvelope<TData = unknown> {
  data: TData | null;
  xmlData: string | null;
  httpCode: number;
  messages: ApiMessage[] | null;
  succeeded: boolean;
}

/** Result of a signed request: HTTP status + parsed envelope (when JSON). */
export interface ApiResponse<TData = unknown> {
  status: number;
  ok: boolean;
  body: ApiEnvelope<TData> | null;
  rawText: string;
  /** Business error codes extracted from `messages[]`, for convenient asserts. */
  errorCodes: string[];
}

/** Known business error codes referenced by negative tests (see spec §2.3). */
export const ErrorCodes = {
  INVALID_SIGNATURE: 'E0208',
  INVALID_ENDPOINT: 'E0209',
  INVALID_API_KEY: 'E0210',
  INVALID_PORT: 'E0211',
  GENERAL_EXCEPTION: 'E0166',
  STATUS_NOT_FOUND: 'E0203',
  ACTION_NOT_ALLOWED: 'E0204',
  INVALID_FIELDS_OR_VALUES: 'E0207',
} as const;
