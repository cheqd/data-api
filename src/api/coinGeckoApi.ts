// import { Account, Coin } from "../types/node";
import { RootObject } from "../types/prices";

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

	arbitrage_opportunity(bit_mart: number, gate_io: number, osmosis_atom: number, osmosis_osmo: number): boolean {
		const arbitrage_percentage = 4;
		let arbitrage_opportunity = false;

		if (
			this.calculate_difference_percentage(bit_mart, gate_io) > arbitrage_percentage ||
			this.calculate_difference_percentage(bit_mart, osmosis_atom) > arbitrage_percentage ||
			this.calculate_difference_percentage(bit_mart, osmosis_osmo) > arbitrage_percentage ||
			this.calculate_difference_percentage(gate_io, osmosis_atom) > arbitrage_percentage ||
			this.calculate_difference_percentage(gate_io, osmosis_osmo) > arbitrage_percentage ||
			this.calculate_difference_percentage(osmosis_atom, osmosis_osmo) > arbitrage_percentage) {
			arbitrage_opportunity = true
		} else {
			arbitrage_opportunity = false
		}

		return arbitrage_opportunity;
	}
}

