import { Prices, RootObject } from "../types/prices";

export class CoinGeckoApi {

	constructor(public readonly base_coingecko_api_url: string) {
	}

	async get_coingecko_data(): Promise<RootObject> {
		let resp = await fetch(`${this.base_coingecko_api_url}/coins/cheqd-network/tickers`);
		let respJson = await resp.json() as RootObject;

		return respJson;
	}

	calculate_difference_percentage(a: number, b: number): number {
		return 100 * Math.abs((a - b) / ((a + b) / 2));
	}

	arbitrage_opportunity(prices: Prices): boolean {
		const arbitrage_percentage = 4;
		var arbitrage_opportunity = false;

		for (let i=0; i<prices.length; i++) {
			for (let j=i+1; j<prices.length; j++) {
				if (this.calculate_difference_percentage(prices[i].price, prices[j].price) > arbitrage_percentage) {
					arbitrage_opportunity = true;
				} else {
					arbitrage_opportunity = false;
				}
			}
		}
		
		return arbitrage_opportunity;
	}
}

