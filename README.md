# Cosmos SDK: Custom Data APIs

[![GitHub license](https://img.shields.io/github/license/cheqd/data-api?color=blue&style=flat-square)](https://github.com/cheqd/data-api/blob/main/LICENSE) [![GitHub contributors](https://img.shields.io/github/contributors/cheqd/data-api?label=contributors%20%E2%9D%A4%EF%B8%8F&style=flat-square)](https://github.com/cheqd/data-api/graphs/contributors)

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/cheqd/data-api/Workflow%20Dispatch?label=workflows&style=flat-square)](https://github.com/cheqd/data-api/actions/workflows/dispatch.yml) ![GitHub repo size](https://img.shields.io/github/repo-size/cheqd/data-api?style=flat-square)

## ℹ️ Overview

Cosmos SDK offers [APIs for built-in modules using gRPC, REST, and Tendermint RPC](https://docs.cosmos.network/master/core/grpc_rest.html). This project aims to provide simple REST APIs for data that default Cosmos SDK APIs can't provide.

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

This API calculates the circulating supply by **subtracting** the account balances of a defined list of wallet addresses ("circulating supply watchlist"). Different types of accounts defined in the watchlist are handled as follows:

1. **Base accounts and Continuous Vesting accounts**: These will always have an entry in BigDipper block explorer, since these accounts have transactions that trigger indexing.
2. **Delayed Vesting accounts**: These accounts present a complex scenario since BigDipper does _not_ index all delayed vesting accounts by default.
   1. **If there have been ANY transactions involving the delayed vesting account**: Delayed vesting accounts can still stake their original vesting allowance, or the account holder may have transferred additional funds into the account. In this scenario, the account _will_ be indexed by BigDipper and the account balance can be fetched via the GraphQL API.
   2. **If there have been NO transactions involving the delayed vesting account**: Delayed vesting accounts with no other transactions beyond the original creation are _not_ indexed by BigDipper. Balances for these accounts are fetched using the standard Cosmos SDK `/cosmos/bank/v1beta1/balances/<address>` REST API endpoint.

### 🥩 Total staked supply

#### Endpoints

[`data-api.cheqd.io/supply/staked`](https://data-api.cheqd.io/supply/staked)

#### Response

Overall tokens staked, in CHEQ.

#### Rationale

Provides the overall amount staked pulled from the block explorer.

### 🗳 Delegator count by validator

#### Endpoint

[`data-api.cheqd.io/staking/delegators/<validator-address>`](https://data-api.cheqd.io/staking/delegators/cheqdvaloper1lg0vwuu888hu4arnt9egtqrm2662kcrtf2unrs)

#### Response

Number of delegators who delegate to a specific validator.

#### Rationale

There is no simple Cosmos SDK API to fetch the number of delegators for a given validator.

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

### 🚨 Arbitrage

#### Endpoint

- Results filtered by threshold value: [`data-api.cheqd.io/arbitrage`](https://data-api.cheqd.io/arbitrage)
- Unfiltered results: [`data-api.cheqd.io/arbitrage/all`](https://data-api.cheqd.io/arbitrage/all)

#### Response

Returns current price of CHEQ token among different markets along with an evaluation of whether they are at risk of arbitrage opportunities.

#### Rationale

The CHEQ token trades on multiple markets/exchanges (e.g., [Osmosis](https://app.osmosis.zone), [Gate.io](https://www.gate.io/trade/CHEQ_USDT), [BitMart](https://www.bitmart.com/trade/en?layout=basic&symbol=CHEQ_USDT), [LBank](https://www.lbank.info/exchange/cheq/usdt), [Uniswap](https://app.uniswap.org/#/swap?inputCurrency=0x70edf1c215d0ce69e7f16fd4e6276ba0d99d4de7&outputCurrency=0xdac17f958d2ee523a2206206994597c13d831ec7&chain=mainnet)). This is typically established as CHEQ along with another token pair or currency.

Fluctuations in the exchange rate between CHEQ and other tokens pairs can give rise to opportunities for arbitrage. Having a significant market arbitrage among different exchanges creates a [market inefficiencies](https://www.investopedia.com/terms/i/inefficientmarket.asp). Extreme market inefficiencies result [market failure](https://www.investopedia.com/terms/m/marketfailure.asp) and [deadweight loss](https://www.investopedia.com/terms/d/deadweightloss.asp).

Having monitoring capabilities for arbitrage gives opportunities for the cheqd community to rectify potential liquidity issues and aware of exchange rate movements.

#### Alerting via Zapier

To alert a significant market arbitrages for CHEQ listings on different exchanges, we pull latest markets data from the [CoinGecko API for cheqd's ticker page](https://www.coingecko.com/en/coins/cheqd-network) via our Market Monitoring API [Monitor Markets API](https://github.com/cheqd/market-monitoring). If an arbitrage threshold is exceeded, a webhook trigger is sent to [Zapier](https://zapier.com/) for alerting via different channels (such as Slack).

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

Wrangler CLI uses [`wrangler.toml` for configuring](https://developers.cloudflare.com/workers/wrangler/configuration/) the application. If you're using this for your own purposes, you will need to replace values for `account_id`, [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) bindings, `route`, etc. for the application to work correctly along with your own [Cloudflare API tokens](https://developers.cloudflare.com/api/tokens/create).

For the circulating supply API endpoint, Cloudflare Workers will expect to find a Cloudflare KV namespace called `CIRCULATING_SUPPLY_WATCHLIST` with a list of addresses in the `key`. The application _only_ uses the key, so value can be anything.

Delayed vesting accounts that have never been involved in a transaction (as described above) should be prefixed with a `delayed:` prefix in the JSON file. Cloudflare allows [filtering KV pair `key`s by prefixes](https://developers.cloudflare.com/workers/runtime-apis/kv/#more-detail) when using a list operation.

```jsonc
// Sample watchlist JSON file structure
[
  {
    "key": "cheqd1...xxx",
    "value": "26-May-2022" // This can be any value
  },
  {
    "key": "delayed:cheqd1...xxx", // This is a delayed account that won't be indexed by BigDipper
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

The [**cheqd Community Slack**](http://cheqd.link/join-cheqd-slack) is our primary chat channel for the open-source community, software developers, and node operators.

Please reach out to us there for discussions, help, and feedback on the project.

## 🙋 Find us elsewhere

[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/cheqd) [![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](http://cheqd.link/discord-github) [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/intent/follow?screen_name=cheqd_io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](http://cheqd.link/linkedin) [![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)](http://cheqd.link/join-cheqd-slack) [![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://blog.cheqd.io) [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UCBUGvvH6t3BAYo5u41hJPzw/)
