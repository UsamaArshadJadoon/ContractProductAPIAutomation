import Ajv, { type AnySchema, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Thin Ajv wrapper. Schemas are intentionally lenient about extra fields
 * (the API may add fields) but strict about the types of known fields.
 */
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const cache = new Map<string, ValidateFunction>();

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validate(schema: AnySchema, data: unknown, cacheKey?: string): ValidationResult {
  let fn: ValidateFunction;
  if (cacheKey && cache.has(cacheKey)) {
    fn = cache.get(cacheKey)!;
  } else {
    fn = ajv.compile(schema);
    if (cacheKey) cache.set(cacheKey, fn);
  }
  const valid = fn(data) as boolean;
  const errors = (fn.errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim());
  return { valid, errors };
}
