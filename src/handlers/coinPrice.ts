import { Request } from "itty-router";
import { Prices } from "../types/prices";
import { CoinGeckoApi } from "../api/coinGeckoApi";

export async function handler(request: Request): Promise<Response> {
    let coinGeckoApi = new CoinGeckoApi(COINGECKO_API);
    let coingecko = await coinGeckoApi.get_coingecko_data();
    let prices = {} as Prices;

    for (let i = 0; i < coingecko.tickers.length; i++) {
        var item = coingecko.tickers[i].market.name;
        switch(item) {
            case 'BitMart':
                prices.bit_mart = coingecko.tickers[i].converted_last.usd;
            break;
            case 'Gate.io':
                prices.gate_io = coingecko.tickers[i].converted_last.usd;
            break;
            case 'Osmosis':
                if (coingecko.tickers[i].target_coin_id === "osmosis" && coingecko.tickers[i].coin_id === "cheqd-network") {
                    prices.osmosis_osmo = coingecko.tickers[i].converted_last.usd;
                } else if (coingecko.tickers[i].target_coin_id === "cheqd-network" && coingecko.tickers[i].coin_id === "cosmos") {
                    prices.osmosis_atom = coingecko.tickers[i].converted_last.usd;
                }
            break;
        }
    }

    prices.arbitrage_opportunity = coinGeckoApi.arbitrage_opportunity(prices.bit_mart, prices.gate_io, prices.osmosis_atom, prices.osmosis_osmo);
    
    return new Response(JSON.stringify(prices), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      });
}
