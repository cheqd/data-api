# Cosmos SDK: Custom Data APIs

[![GitHub license](https://img.shields.io/github/license/cheqd/data-api?color=blue&style=flat-square)](https://github.com/cheqd/data-api/blob/main/LICENSE) [![GitHub contributors](https://img.shields.io/github/contributors/cheqd/data-api?label=contributors%20%E2%9D%A4%EF%B8%8F&style=flat-square)](https://github.com/cheqd/data-api/graphs/contributors)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cheqd/data-api/dispatch.yml?label=workflows&style=flat-square)](https://github.com/cheqd/.github/actions/workflows/dispatch.yml) ![GitHub repo size](https://img.shields.io/github/repo-size/cheqd/data-api?style=flat-square)

## ℹ️ Overview

Cosmos SDK offers [APIs for built-in modules using gRPC, REST, and Tendermint RPC](https://docs.cosmos.network/main/learn/advanced/grpc_rest). This project aims to provide simple REST APIs for data that default Cosmos SDK APIs can't provide.

This collection of custom APIs can be deployed as a [Cloudflare Worker](https://workers.cloudflare.com/) or compatible serverless platforms.

## 🔍 API Endpoints & Features

### 🧮 Total Supply

#### Endpoints

[`data-api.cheqd.io/supply/total`](https://data-api.cheqd.io/supply/total) (also has an API endpoint alias on `/`)

#### Response

_Just_ total supply of tokens, in main token denomination (CHEQ instead of `ncheq` in our case)

#### Rationale

Cryptocurrency tracking websites such as [CoinMarketCap](https://coinmarketcap.com/currencies/cheqd/) and [CoinGecko](https://www.coingecko.com/en/coins/cheqd-network) require an API endpoint for reporting the total supply of tokens in the main/primary token denomination.

While this figure is available from Cosmos SDK's built-in [`/cosmos/bank/v1beta1/supply/ncheq`](https://api.cheqd.net/cosmos/bank/v1beta1/supply/ncheq) REST endpoint, this returns a JSON object in the lowest token denomination, which cannot be parsed by CoinMarketCap / CoinGecko.

### 🔂 Circulating Supply

#### Endpoint

[`data-api.cheqd.io/supply/circulating`](https://data-api.cheqd.io/supply/circulating)

#### Response

Circulating token supply, in main token denomination (CHEQ instead of _ncheq_ in our case)

#### Rationale

Cryptocurrency tracking websites such as [CoinMarketCap](https://coinmarketcap.com/currencies/cheqd/) and [CoinGecko](https://www.coingecko.com/en/coins/cheqd-network) require an API endpoint for reporting the circulating supply of tokens in the main/primary token denomination.

This figure is _not_ available from any Cosmos SDK API, because the [criteria for determining circulating vs "non-circulating" accounts is defined by CoinMarketCap](https://support.coinmarketcap.com/hc/en-us/articles/360043396252-Supply-Circulating-Total-Max-).

This API calculates the circulating supply by **subtracting** the account balances of a defined list of wallet addresses ("circulating supply watchlist") from the total supply.

### 🥩 Total staked supply

#### Endpoints

[`data-api.cheqd.io/supply/staked`](https://data-api.cheqd.io/supply/staked)

#### Response

Overall tokens staked, in CHEQ.

#### Rationale

Provides the overall amount staked pulled from the block explorer.

### 🔐 Vesting Account Balance

#### Endpoint

[`data-api.cheqd.io/balances/vesting/<address>`](https://data-api.cheqd.io/balances/vesting/cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr)

#### Response

Tokens that are still vesting for continuous/delayed vesting accounts, in CHEQ.

#### Rationale

There is no Cosmos SDK API that returns balances that are yet to be vested for [continuous or delayed vesting accounts](https://docs.cosmos.network/v0.45/modules/auth/05_vesting.html#vesting-account-types).

### 🔒 Vested Account Balance

#### Endpoint

[`data-api.cheqd.io/balances/vested/<address>`](https://data-api.cheqd.io/balances/vesting/cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr)

#### Response

Tokens that have already vested for continuous/delayed vesting accounts, in CHEQ.

#### Rationale

There is no Cosmos SDK API that returns balances that are already vested for [continuous or delayed vesting accounts](https://docs.cosmos.network/v0.45/modules/auth/05_vesting.html#vesting-account-types).

### 💸 Liquid Account Balance

#### Endpoint

[`data-api.cheqd.io/balances/liquid/<address>`](https://data-api.cheqd.io/balances/vesting/cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr)

#### Response

Tokens in continuous/delayed vesting accounts that can be converted to liquid balances, in CHEQ.

#### Rationale

Tokens in [continuous or delayed vesting accounts](https://docs.cosmos.network/v0.45/modules/auth/05_vesting.html#vesting-account-types) that can be converted to liquid balances. This is calculated as the sum of the following figures:

1. "Delegated free" balance (from the `/cosmos/auth/v1beta1/accounts/<address>` REST API) _or_ vested balance, whichever is higher
2. "Available" balance (if applicable)
3. "Reward" balance (if applicable)

### 💰 Total Account Balance

#### Endpoint

[`data-api.cheqd.io/balances/total/<address>`](https://data-api.cheqd.io/balances/total/cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr)

#### Response

Total account balance for specified account, in CHEQ.

#### Rationale

The standard Cosmos SDK REST API for account balances returns JSON with the account balances along with its denomination, usually the lowest denomination. This is hard to parse in applications such as Google Sheets (e.g., to monitor the account balance by fetching a response from a REST API directly in Google Sheets). This API returns a plain number that can be directly plugged into such applications, without having to parse JSON.

### 📊 Identity Analytics

#### Endpoints

##### Mainnet

[`data-api.cheqd.io/analytics/mainnet`](https://data-api.cheqd.io/analytics/mainnet)

[`data-api.cheqd.io/analytics/mainnet/did`](https://data-api.cheqd.io/analytics/mainnet/did)

[`data-api.cheqd.io/analytics/mainnet/resource`](https://data-api.cheqd.io/analytics/mainnet/resource)

##### Testnet

[`data-api.cheqd.io/analytics/testnet`](https://data-api.cheqd.io/analytics/testnet)

[`data-api.cheqd.io/analytics/testnet/did`](https://data-api.cheqd.io/analytics/testnet/did)

[`data-api.cheqd.io/analytics/testnet/resource`](https://data-api.cheqd.io/analytics/testnet/resource)

#### Response

Returns the identity transactions data for the specified network in JSON format.
By default, the endpoint returns the data for the **last 30 days**.

If `did` or `resource` is not specified, it will both DID and DLR analytics data, sorted by date in descending order.
By default, the response is paginated with a limit of 100 results per page.

#### Query Parameters

* `startDate`: Start date for the analytics data.
* `endDate`: End date for the analytics data.
* `operationType`: Operation type for the analytics data. It accepts the following values:
  * `createDid`
  * `updateDid`
  * `deactivateDid`
  * `createResource`
* `ledgerOperationType`: Ledger operation type for the analytics data. It accepts the following values:
  * `cheqd.did.v2.MsgCreateDid`
  * `cheqd.did.v2.MsgUpdateDid`
  * `cheqd.did.v2.MsgDeactivateDid`
  * `cheqd.resource.v2.MsgCreateResource`
* `denom`: Friendly denomination used for paying fees, e.g. `CHEQ` or `USDC`.
* `ledgerDenom`: Ledger denomination used for paying fees, e.g. `ncheq` or `ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4`.
* `feePayer`: Fee payer address.
* `success`: Whether transaction was successful.
* `page`: Page number for pagination.
* `limit`: Number of results per page.

#### Rationale

The purpose of this API is to provide more granular data and help us to understand the usage of identity modules and how they are used by the community.

#### Example

```bash
curl -X GET "https://data-api.cheqd.io/analytics/mainnet?startDate=2024-01-01&endDate=2024-01-31&operationType=createDid&denom=CHEQ&&success=true&limit=1"
```

Response:

```json
{"items":[{"didId":"did:cheqd:mainnet:f1a32c8b-bd76-450d-b5c2-46b1b92db74d","operationType":"createDid","feePayer":"cheqd15yqrljq6h7u8et30hqrwwaz8f9m62jvztlpc9t","amount":50,"denom":"CHEQ","blockHeight":"11709907","transactionHash":"36EEBB3E4551CC9BB1A70FACB9775AB8DD12F5ABF931A60322558C03F91822B9","createdAt":"2024-01-25T19:49:35.093Z","success":true}],"totalCount":7,"page":1,"limit":1,"totalPages":7}
```

## 🧑‍💻🛠 Developer Guide

### Architecture

This frontend site was developed to work with [Cloudflare Workers](https://workers.cloudflare.com/), a serverless and highly-scalable platform.

Originally, this project was discussed as potentially being deployed using a serverless platform such as [AWS Lambda](https://aws.amazon.com/lambda/). However, [AWS Lambda has a cold-start problem](https://mikhail.io/serverless/coldstarts/aws/) if the API doesn't receive too much traffic or is only accessed infrequently. This can lead to start times ranging into single/double digit seconds, which would be considered an API timeout by many client applications.

Using Cloudflare Workers, these APIs can be served in a highly-scalable fashion and have much lower cold-start times, i.e., in the range of less than 10 milliseconds.

### Setup

The recommended method of interacting with this repository is using [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/).

Dependencies can be installed using Yarn or any other package manager.

```bash
npm install
```

While our deployment uses Cloudflare Wrangler, the application itself could be modified to run on other platforms with some refactoring.

### Configuration

Wrangler CLI uses [`wrangler.toml` for configuring](https://developers.cloudflare.com/workers/wrangler/configuration/) the application. If you're using this for your own purposes, you will need to replace values for `account_id`, [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) bindings, `route`, etc. for the application to work correctly along with your own [Cloudflare API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

#### Environment variables

The application expects these environment variables to be set on Cloudflare:

1. `TOKEN_EXPONENT`: Denominator for token (default `9` for CHEQ token).
2. `REST_API`: REST API for a Cosmos/cheqd node to target for queries.
3. `REST_API_PAGINATION_LIMIT`: Number of results to fetch in a single query, for queries that require iterating multiple times. (E.g., many account balance queries require this, to be able to get all delegations etc.)
4. `GRAPHQL_API`: GraphQL API for a BigDipper explorer instance for some queries. E.g., the GraphQL API for [cheqd's block explorer](https://explorer.cheqd.io/) is `https://explorer-gql.cheqd.io/v1/graphql`.
5. `CIRCULATING_SUPPLY_GROUPS`: Number of sub-groups the circulating supply watchlist is split into (see sample JSON file below). This is to ensure that any lookups from APIs can be spaced out.
6. `MARKET_MONITORING_API`: Upstream API for running queries from CoinGecko API (see the [market-monitoring repository](https://github.com/cheqd/market-monitoring)).
7. `WEBHOOK_URL`: Zapier webhook URL to send market monitoring data to. Since this is a secret, it's not set in plaintext in `wrangler.toml` but passed via GitHub Actions secrets.

#### Cloudflare KV bindings

Cached data for computationally-expensive queries are stored in [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/).

1. `CIRCULATING_SUPPLY_WATCHLIST`: This KV is pre-populated with a list of addresses to monitor for circulating supply. Initially, the *value* portion of this can be set to anything, since it will get replaced when [periodic cron triggers](https://developers.cloudflare.com/workers/platform/cron-triggers) run to set the account balance breakdown for this account. In case you have a lot of accounts to monitor, we recommend prefixing the *key* with a `group_N` prefix which will stagger the API lookup across multiple cron executions.

```jsonc
// Sample watchlist JSON file structure
[
  {
    "key": "group_1:cheqd1...xxx", // Group 1 prefix
    "value": "26-May-2022" // This can be any value, and will be updated with account balance breakdown periodically
  },
  {
    "key": "group_2:cheqd1...xxx", // Group 2 prefix
    "value": "26-May-2022"
  }
]
```

Tip: There are online converter tools to [transform CSV files to JSON files](https://csvjson.com/csv2json), which is an easy way of converting spreadsheets to JSON.

#### Bulk-uploading to Cloudflare KV

Entries can [bulk-uploaded to Cloudflare KV using Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#kvbulk):

```bash
wrangler kv:bulk put <watchlist-file.json> --binding "CIRCULATING_SUPPLY_WATCHLIST" --preview false
```

#### Bulk-deleting from Cloudflare KV

Entries can [bulk-deleted from Cloudflare KV using Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#kvbulk) by providing a JSON file with list of keys to delete. This JSON file should be in the form `["key1", "key2", ...]`.

```bash
wrangler kv:bulk delete <watchlist-delete.json> --binding "CIRCULATING_SUPPLY_WATCHLIST" --preview false
```

### Local Development

Wrangler CLI can serve a preview where the code and KV pairs are served from Cloudflare. This also automatically executes a build to be able to serve up the app.

```bash
wrangler dev
```

This option will bind itself to the `preview_id` KV namespace binding (if defined).

Wrangler CLI also allows a degree of local development by running the web framework locally, but this option still relies on Cloudflare backend for aspects such as Cloudflare Workers KV.

```bash
wrangler dev --local
```

If you want _completely_ standalone local development, this can achieved using an emulator framework like [Miniflare](https://miniflare.dev/).

### Deploy

Modify the required variables in `wrangler.toml` for [publishing to Cloudflare Workers](https://developers.cloudflare.com/workers/wrangler/commands/) and execute the following command to execute a build and production deployment.

```bash
wrangler publish
```

Other environments can be targetted (if defined in `wrangler.toml`) by specifying the `--env` flag:

```bash
wrangler publish --env staging
```

CI/CD deployments can be achieved using the [`wrangler` Github Action](https://github.com/cloudflare/wrangler-action). The [`deploy.yml` Github Action in this repo](https://github.com/cheqd/data-api/blob/main/.github/workflows/deploy.yml) provides an example of this can be achieved in practice.

## 🐞 Bug reports & 🤔 feature requests

If you notice anything not behaving how you expected, or would like to make a suggestion / request for a new feature, please create a [**new issue**](https://github.com/cheqd/data-api/issues/new/choose) and let us know.

## 💬 Community

Our [**Discord server**](http://cheqd.link/discord-github) is the primary chat channel for our open-source community, software developers, and node operators.

Please reach out to us there for discussions, help, and feedback on the project.

## 🙋 Find us elsewhere

[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/cheqd) [![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](http://cheqd.link/discord-github) [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/intent/follow?screen_name=cheqd_io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](http://cheqd.link/linkedin) [![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://blog.cheqd.io) [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UCBUGvvH6t3BAYo5u41hJPzw/)
