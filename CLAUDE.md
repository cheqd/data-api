# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Local dev server (staging env, port 8787)
- `npm run build` — Dry-run deploy to generate dist
- `npm run format` — Prettier format all files
- `npm run lint` — ESLint check (config at `.github/linters/eslint.config.mjs`)
- `npm run lint:fix` — ESLint autofix
- `npm run db:generate` — Generate Drizzle migration from schema changes
- `npm run db:migrate` — Push schema to database
- `npm run db:seed` — Seed reference data (denoms, operation types)

## Architecture

Cloudflare Worker for the cheqd blockchain network. Two entry points in `src/index.ts`:

1. **`fetch`** — HTTP API via itty-router. Serves supply data, account balances, and identity analytics.
2. **`scheduled`** — Hourly cron trigger that updates cached circulating supply balances and syncs identity data from BigDipper GraphQL into PostgreSQL.

### Data flow

- **Supply/balance endpoints** — Handlers in `src/handlers/` call external APIs (`src/api/`) via helpers. The Cosmos SDK REST API (`REST_API`) provides account data; BigDipper GraphQL (`GRAPHQL_API`) provides total supply and identity transactions.
- **Circulating supply** — Watchlist addresses are stored in Cloudflare KV, grouped by `group_N:` prefix. The hourly cron processes one group per hour (24 groups = 24 hours), updating each address's cached balance breakdown. The circulating supply endpoint subtracts all watchlist balances from total supply.
- **Identity analytics sync** — `SyncService` in `src/helpers/identity.ts` incrementally syncs DID and resource transactions from BigDipper into PostgreSQL (via Hyperdrive). It tracks the last block height to avoid re-processing, with composite key deduplication (txHash + operationType + entityId).
- **Analytics queries** — `src/handlers/analytics.ts` queries the PostgreSQL tables with filtering (date range, operation type, denom, feePayer, didId, success) and pagination. Supports CSV export.

### Database

PostgreSQL accessed through Cloudflare Hyperdrive. Schema in `src/database/schema.ts` mirrors tables for mainnet and testnet (e.g., `did_mainnet`/`did_testnet`, `resource_mainnet`/`resource_testnet`). Each network has its own enum types, denom lookup table, and operation types lookup table. The `TABLES` map in `src/helpers/identity.ts` selects the correct table set by network.

### Environment

All env vars and bindings are typed in `src/worker-types.d.ts` as the global `Env` interface. Key bindings: `HYPERDRIVE` (PostgreSQL connection pooler), `CIRCULATING_SUPPLY_WATCHLIST` (KV namespace). Secrets (`WEBHOOK_URL`) are set via `wrangler secret put`, not in config files.

## Conventions

- Prettier: tabs, single quotes, 120 char width, trailing commas (es5)
- Conventional commits — semantic-release automates versioning and changelogs
- All token amounts are converted from lowest denom (`ncheq`) to main denom (`CHEQ`) using `TOKEN_EXPONENT` (10^9)
