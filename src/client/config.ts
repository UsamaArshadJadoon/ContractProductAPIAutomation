/**
 * Environment configuration for the Contracts API.
 *
 * The HMAC signature is computed over the request host and path, so we keep
 * both the inbound base path (`/api`) and the entity base path (`/api/v2`)
 * explicit per environment.
 */

export type EnvName = 'sandbox' | 'uat';

export interface ContractsEnvConfig {
  /** Host only, no scheme/path — used verbatim in the signature message. */
  host: string;
  /** Full origin, e.g. https://api-sb.contracts.com.sa */
  origin: string;
  /** Base path prefix for inbound Contract services. */
  inboundBasePath: string;
  /** Base path prefix for Entity (v2) services. */
  entityBasePath: string;
}

export interface Credentials {
  clientId: string;
  apiKey: string;
  secretKey: string;
}

export interface SeedData {
  signedContractNumber?: string;
  signedAddendumRef?: string;
  sanadGroupUuid?: string;
  nafathTraceId?: string;
  existingContractNumber?: string;
  existingBeneficiaryNid?: string;
}

function originToHost(origin: string): string {
  return origin.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

/**
 * Read an env var, treating blank/whitespace-only as unset. CI injects
 * `${{ vars.X }}` as an empty string when the repo variable is undefined, so a
 * plain `??` fallback would yield "" and break URL construction.
 */
function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

const SANDBOX_ORIGIN = envOr('SANDBOX_BASE_URL', 'https://api-sb.contracts.com.sa');
const UAT_ORIGIN = envOr('UAT_BASE_URL', 'https://api-uat.contracts.com.sa');

const ENVIRONMENTS: Record<EnvName, ContractsEnvConfig> = {
  sandbox: {
    origin: SANDBOX_ORIGIN,
    host: originToHost(SANDBOX_ORIGIN),
    inboundBasePath: '/api',
    entityBasePath: '/api/v2',
  },
  uat: {
    origin: UAT_ORIGIN,
    host: originToHost(UAT_ORIGIN),
    inboundBasePath: '/api',
    entityBasePath: '/api/v2',
  },
};

export function getEnvName(): EnvName {
  const raw = (process.env.CONTRACTS_ENV ?? 'sandbox').toLowerCase();
  if (raw !== 'sandbox' && raw !== 'uat') {
    throw new Error(`CONTRACTS_ENV must be "sandbox" or "uat", got "${raw}"`);
  }
  return raw;
}

export function getEnvConfig(env: EnvName = getEnvName()): ContractsEnvConfig {
  return ENVIRONMENTS[env];
}

export function getCredentials(): Credentials {
  const clientId = process.env.CONTRACTS_CLIENT_ID ?? '';
  const apiKey = process.env.CONTRACTS_API_KEY ?? '';
  const secretKey = process.env.CONTRACTS_SECRET_KEY ?? '';
  return { clientId, apiKey, secretKey };
}

export function hasCredentials(): boolean {
  const { clientId, apiKey, secretKey } = getCredentials();
  return Boolean(clientId && apiKey && secretKey);
}

export function getSeedData(): SeedData {
  const orUndef = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
  return {
    signedContractNumber: orUndef(process.env.SIGNED_CONTRACT_NUMBER),
    signedAddendumRef: orUndef(process.env.SIGNED_ADDENDUM_REF),
    sanadGroupUuid: orUndef(process.env.SANAD_GROUP_UUID),
    nafathTraceId: orUndef(process.env.NAFATH_TRACE_ID),
    existingContractNumber: orUndef(process.env.EXISTING_CONTRACT_NUMBER),
    existingBeneficiaryNid: orUndef(process.env.EXISTING_BENEFICIARY_NID),
  };
}
