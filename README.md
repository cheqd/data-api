# Cosmos SDK: Custom Data APIs

Cosmos SDK offers [APIs for built-in modules using gRPC, REST, and Tendermint RPC](https://docs.cosmos.network/master/core/grpc_rest.html).

This project aims to fill in the gaps for data that the default Cosmos SDK APIs can't provide - at least not directly.

This collection of custom APIs can be deployed as a [Cloudflare Worker](https://workers.cloudflare.com/) or similar lightweight on-demand compute platform.

## Examples of API endpoints covered

1. Return *just* the number of tokens in total supply. This is extremely helpful for Cosmos SDK chains that need to provide data to CoinMarketCap.
2. Ability to understand vested vs non-vested tokens for vesting accounts.
