# Cosmos SDK: Custom Data APIs

## ℹ️ Overview

Cosmos SDK offers [APIs for built-in modules using gRPC, REST, and Tendermint RPC](https://docs.cosmos.network/master/core/grpc_rest.html). This project aims to provide simple REST APIs for data that default Cosmos SDK APIs can't provide.

This collection of custom APIs can be deployed as a [Cloudflare Worker](https://workers.cloudflare.com/) or compatible serverless platforms.

## 🔍 API Endpoints & Features

### 🧮 Total Supply

#### Endpoints

`/` or `/supply/total` (available at [data-api.cheqd.io/supply/total](https://data-api.cheqd.io/supply/total))

#### Response

*Just* total supply of tokens, in main token denomination (CHEQ instead of `ncheq` in our case)

#### Rationale

Cryptocurrency tracking websites such as [CoinMarketCap](https://coinmarketcap.com/currencies/cheqd/) and [CoinGecko](https://www.coingecko.com/en/coins/cheqd-network) require an API endpoint for reporting the total supply of tokens in the main/primary token denomination.

While this figure is available from Cosmos SDK's built-in [`/cosmos/bank/v1beta1/supply/ncheq`](https://api.cheqd.net/cosmos/bank/v1beta1/supply/ncheq) REST endpoint, this returns a JSON object in the lowest token denomination, which cannot be parsed by CoinMarketCap / CoinGecko.

### 🔂 Circulating Supply

#### Endpoint

`/supply/circulating` (available at [data-api.cheqd.io/supply/circulating](https://data-api.cheqd.io/supply/circulating))

#### Response

Circulating token supply, in main token denomination (CHEQ instead of `ncheq` in our case)

#### Rationale

Cryptocurrency tracking websites such as [CoinMarketCap](https://coinmarketcap.com/currencies/cheqd/) and [CoinGecko](https://www.coingecko.com/en/coins/cheqd-network) require an API endpoint for reporting the circulating supply of tokens in the main/primary token denomination.

This figure is *not* available from any Cosmos SDK API, because the [criteria for determining circulating vs "non-circulating" accounts is defined by CoinMarketCap](https://support.coinmarketcap.com/hc/en-us/articles/360043396252-Supply-Circulating-Total-Max-).

This API calculates the circulating supply by **subtracting** the account balances of a defined list of wallet addresses ("circulating supply watchlist").

### 🔐 Vesting Account Balance

#### Endpoint

`/balances/vesting/<address>` (e.g., [data-api.cheqd.io/balances/vesting/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg](https://data-api.cheqd.io/balances/vesting/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg))

#### Response

Tokens that are still vesting for continuous/delayed vesting accounts, in CHEQ.

#### Rationale

There is no Cosmos SDK API that returns balances that are yet to be vested for [continuous or delayed vesting accounts](https://docs.cosmos.network/master/modules/auth/05_vesting.html#vesting-account-types).

### 💸 Liquid Account Balance

#### Endpoint

`/balances/liquid/<address>` (e.g., [data-api.cheqd.io/balances/liquid/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg](https://data-api.cheqd.io/balances/liquid/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg))

#### Response

Tokens in continuous/delayed vesting accounts that can actually be spent/transferred with no wait time, in CHEQ.

#### Rationale

Tokens in [continuous or delayed vesting accounts](https://docs.cosmos.network/master/modules/auth/05_vesting.html#vesting-account-types) can be delegated even if they are not yet vested. This results in a scenario where an account might be able to stake a large part of their vesting balance, but the liquid amount available (e.g., to pay for transaction fees) is not easily available from Cosmos SDK's built-in REST APIs.

### 💰 Total Account Balance

#### Endpoint

`/balances/total/<address>` (e.g., [data-api.cheqd.io/balances/total/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg](https://data-api.cheqd.io/balances/total/cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg))

#### Response

Total account balance for specified account, in CHEQ.

#### Rationale

The standard Cosmos SDK REST API for account balances returns JSON with the account balances along with its denomination, usually the lowest denomination. This is hard to parse in applications such as Google Sheets (e.g., to monitor the account balance by fetching a response from a REST API directly in Google Sheets). This API returns a plain number that can be directly plugged into such applications, without having to parse JSON.

## 🧑‍💻🛠 Developer Guide

### Architecture

This frontend site was developed to work with [Cloudflare Workers](https://workers.cloudflare.com/), a serverless and highly-scalable platform.

Originally, this project was discussed as potentially being deployed using a serverless platform such as [AWS Lambda](https://aws.amazon.com/lambda/). However, [AWS Lambda has a cold-start problem](https://mikhail.io/serverless/coldstarts/aws/) if the API doesn't receive too much traffic or is only accessed infrequently. This can lead to start times ranging into single/double digit seconds, which would be considered an API timeout by many client applications.

Using Cloudflare Workers, these APIs can be served in a highly-scalable fashion and have much lower cold-start times, i.e., in the range of less than 10 milliseconds.

### Setup

The recommended method of interacting with this repository is using [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/).

Dependencies can be installed using Yarn or any other package manager.

```bash
yarn install
```

While our deployment uses Cloudflare Wrangler, the application itself could be modified to run on other platforms with some refactoring.

### Configuration

Wrangler CLI uses [`wrangler.toml` for configuring](https://developers.cloudflare.com/workers/wrangler/configuration/) the application. If you're using this for your own purposes, you will need to replace values for `account_id`, [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) bindings, `route`, etc. for the application to work correctly along with your own [Cloudflare API tokens](https://developers.cloudflare.com/api/tokens/create).

For the circulating supply API endpoint, Cloudflare Workers will expect to find a Cloudflare KV namespace called `CIRCULATING_SUPPLY_WATCHLIST` with a list of addresses in the `key`. The application *only* uses the key, so value can be anything.

```jsonc
// Sample watchlist JSON file structure
[
  {
    "key": "cheqd1...xxx",
    "value": "26-May-2022" // This can be any value
  },
]
```

Tip: There are online converter tools to [transform CSV files to JSON files](https://csvjson.com/csv2json), which is an easy way of converting spreadsheets to JSON.

Entries can bulk-uploaded to Cloudflare KV using Wrangler CLI (see [Wrangler CLI documentation for understanding the `kv:bulk` command](https://developers.cloudflare.com/workers/wrangler/commands/#kvbulk) parameters):

```bash
wrangler kv:bulk put <watchlist-file.json> --binding "CIRCULATING_SUPPLY_WATCHLIST" --preview false
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

If you want *completely* standalone local development, this can achieved using an emulator framework like [Miniflare](https://miniflare.dev/).

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
