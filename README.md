# Contracts API Automation

Automated API test suite for the **Saudi AZM Digital Contracts API** (Integration
Specification Document v3.4.4), built with **Playwright Test + TypeScript** and
wired for **GitHub Actions** CI/CD.

It covers all **19 endpoints** (17 inbound `Contract/*` services + 2 `Entity/*`
v2 services) with HMAC-SHA256 request signing, JSON-schema response validation,
negative/auth tests, conditional handling of Nafath-signed-state endpoints, and
an end-to-end contract-lifecycle chain.

## Quick start

```bash
npm install
cp .env.example .env       # fill in CONTRACTS_CLIENT_ID / API_KEY / SECRET_KEY
npm run gen:fixture        # generate the placeholder sample contract PDF
npm test                   # run the whole suite
```

Useful scripts:

| Command | What it runs |
| --- | --- |
| `npm run test:unit` | Offline, deterministic signer tests (no network) |
| `npm run test:inbound` | Inbound `Contract/*` endpoint tests |
| `npm run test:entity` | Entity `v2` upload tests |
| `npm run test:e2e` | End-to-end lifecycle chain |
| `npm run test:smoke` | `@smoke`-tagged checks (fast sanity) |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | `tsc --noEmit` |

## How authentication works

Every request is signed with HMAC-SHA256 (spec §2.1.1). The single source of
truth is [`src/client/signer.ts`](src/client/signer.ts):

```
data         = JSON of the payload (POST body OR GET query object), nulls removed
encoded_data = base64(utf8(data))
message      = `${METHOD}\n${host}\n${endpointPath}\nt=${timestamp}&ed=${encoded_data}`
signature    = base64( HMAC_SHA256(secretKey, message) )
```

Sent on every request as headers: `X-Contracts-Timestamp`, `X-Contracts-ClientId`,
`X-Contracts-APIKey`, `X-Contracts-Signature`.

- `host` is the bare host (e.g. `api-sb.contracts.com.sa`).
- `endpointPath` includes the base prefix: `/api/...` for inbound, `/api/v2/...`
  for entity endpoints.
- The exact JSON serialization is the one risky, server-dependent part. The
  client sends the **exact bytes it signed**. If the sandbox rejects valid
  requests with **E0208 (Invalid Signature)**, tune `serializeData` in the
  signer — the `Signature smoke` test in [`tests/negative/auth.spec.ts`](tests/negative/auth.spec.ts)
  is designed to catch this quickly.

## Project layout

```
src/
  client/
    signer.ts          HMAC-SHA256 signing (core)
    config.ts          env config (sandbox / uat), credentials, seed data
    contractsClient.ts signed request wrapper over Playwright's request context
    types.ts           response envelope + known error codes
  endpoints/catalog.ts catalog of all 19 endpoints (path/method/params)
  data/                payload builders + placeholder test data
  schemas/             ajv validator + per-endpoint response schemas
tests/
  unit/                offline signer tests
  inbound/             reads, uploads, signed-state endpoints
  entity/              v2 entity uploads
  negative/            data-driven auth/signature negatives (all endpoints)
  e2e/                 contract-lifecycle chain
  fixtures.ts          signed-client + seed fixtures
  helpers/             shared assertions + sample payloads
scripts/generate-sample-pdf.mjs   builds fixtures/sample-contract.pdf
.github/workflows/api-tests.yml   CI pipeline
```

## Environments

Switch with `CONTRACTS_ENV=sandbox|uat`. Base URLs default in
[`src/client/config.ts`](src/client/config.ts) and can be overridden with
`SANDBOX_BASE_URL` / `UAT_BASE_URL`. The UAT host is a placeholder — set the real
one before running against UAT.

## Test data & placeholders

Beneficiary/contract data in [`src/data/testData.ts`](src/data/testData.ts) is
**placeholder** data generated from the spec enums. Uploads may return business
validation errors until real, valid sandbox values are supplied. Provide real
values via env (see `.env.example`) to turn structured-response assertions into
full happy-path success assertions.

### Nafath-signed-state endpoints

`DownloadSignedDocument`, `DownloadSignedAddendum`, `DownloadSanad`,
`DownloadSanadGroup`, `GetNafathLoginStatus`, and `SignHashedDocument` need a
contract that a human has signed via Nafath. Their **negative paths always run**;
their **happy paths run only when seed data is set** (`SIGNED_CONTRACT_NUMBER`,
`SIGNED_ADDENDUM_REF`, `SANAD_GROUP_UUID`, `NAFATH_TRACE_ID`), otherwise they skip
with an explicit reason.

## CI/CD (GitHub Actions)

[`/.github/workflows/api-tests.yml`](.github/workflows/api-tests.yml) runs on
**push to `main`** and via **manual dispatch** (with an environment picker).
It type-checks, runs the offline unit tests, runs the live API suite, uploads the
HTML + JUnit reports as artifacts, and posts to **Slack on failure**.

Configure these in the GitHub repo:

**Secrets** — `CONTRACTS_CLIENT_ID`, `CONTRACTS_API_KEY`, `CONTRACTS_SECRET_KEY`,
`SLACK_WEBHOOK_URL`, and optionally the seed-data secrets above.

**Variables** — `SANDBOX_BASE_URL`, `UAT_BASE_URL` (optional overrides).

## Security

Real credentials live only in `.env` (gitignored) for local runs and in GitHub
Actions secrets for CI. Never commit `.env`.
