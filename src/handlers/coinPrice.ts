import { Request } from "itty-router";
import { Prices } from "../types/prices";
import { CoinGeckoApi } from "../api/coinGeckoApi";

export async function handler(request: Request): Promise<Response> {
	let coinGeckoApi = new CoinGeckoApi(COINGECKO_API);
	let coingecko = await coinGeckoApi.get_coingecko_data();
	let prices = {} as Prices;

	coingecko.tickers.forEach((ticker) => {
		switch (ticker.market.name) {
			case 'BitMart':
				prices.bit_mart = ticker.converted_last.usd;
				break;
			case 'Gate.io':
				prices.gate_io = ticker.converted_last.usd;
				break;
			case 'Osmosis':
				if (ticker.target_coin_id === "osmosis" && ticker.coin_id === "cheqd-network") {
					prices.osmosis_osmo = ticker.converted_last.usd;
				} else if (ticker.target_coin_id === "cheqd-network" && ticker.coin_id === "cosmos") {
					prices.osmosis_atom = ticker.converted_last.usd;
				}
				break;
		}
	})

	prices.arbitrage_opportunity = coinGeckoApi.arbitrage_opportunity(prices.bit_mart, prices.gate_io, prices.osmosis_atom, prices.osmosis_osmo);
	return new Response(JSON.stringify(prices), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}
