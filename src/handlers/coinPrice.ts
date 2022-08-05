import { Price, Payload } from "../types/prices";
import { CoinGeckoApi } from "../api/coinGeckoApi";

export async function handler(request: Request): Promise<Response> {
	let coinGeckoApi = new CoinGeckoApi(COINGECKO_API);
	let coingecko = await coinGeckoApi.get_coingecko_data();
	var prices = new Array<Price>();
	var arbitrage_opportunity: boolean;

	coingecko.tickers.forEach((ticker) => {
		let coin_pair: Price = {
			market: ticker.market.name,
			coin_pair: ticker.coin_id === "cheqd-network" ? ticker.target_coin_id : ticker.coin_id,
			price: ticker.converted_last.usd,
		};
		prices.push(coin_pair);
	})

	arbitrage_opportunity = coinGeckoApi.arbitrage_opportunity(prices);
	var payload: Payload = {
		markets: prices,
		arbitrage_oportunity: arbitrage_opportunity,
	};
	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}
