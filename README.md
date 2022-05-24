# Cosmos SDK: Custom Data APIs

## ℹ️ Overview

Cosmos SDK offers [APIs for built-in modules using gRPC, REST, and Tendermint RPC](https://docs.cosmos.network/master/core/grpc_rest.html).

This project aims to fill in the gaps for data that the default Cosmos SDK APIs can't provide - at least not directly.

This collection of custom APIs can be deployed as a [Cloudflare Worker](https://workers.cloudflare.com/) or similar lightweight on-demand compute platform.

## 🔍 API Endpoints

1. Return *just* the number of tokens in total supply. This is extremely helpful for Cosmos SDK chains that need to provide data to CoinMarketCap.
2. Ability to understand vested vs non-vested tokens for vesting accounts.

## 🧑‍💻🛠 Developer Guide

### Architecture

This frontend site was developed to work with [Cloudflare Workers](https://workers.cloudflare.com/), a serverless and highly-scalable platform.

Originally, this project was discussed as potentially being deployed using a serverless platform such as [AWS Lambda](https://aws.amazon.com/lambda/). However, [AWS Lambda has a cold-start problem](https://mikhail.io/serverless/coldstarts/aws/) if the API doesn't receive too much traffic or is only accessed infrequently. This can lead to start times ranging into single/double digit seconds, which would be considered an API tiemout by many client applications.

Using Cloudflare Workers, these APIs can be served in a highly-scalable fashion and have much lower cold-start times, i.e., in the range of less than 10 milliseconds.

### Setup

Install dependencies using Yarn

```bash
yarn install
```

### Development

Start the development server on [localhost:3000](http://localhost:3000)

```bash
yarn dev
```

### Build

Build the application for production

```bash
yarn build
```

### Deploy

Use [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) to modify the required variables in `wrangler.toml` for [publishing to Cloudflare Workers](https://developers.cloudflare.com/workers/wrangler/commands/).

```bash
wrangler publish
```
