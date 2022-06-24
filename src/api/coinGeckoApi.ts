// import { Account, Coin } from "../types/node";
import { RootObject } from "../types/prices";

export class CoinGeckoApi {

    constructor(public readonly base_coingecko_api_url: string) {
    }

    async get_coingecko_data(): Promise<RootObject> {
        let resp = await fetch(`${this.base_coingecko_api_url}/coins/cheqd-network/tickers`);
        let respJson: RootObject = await resp.json();

        return respJson;
    }

    calculate_difference_percentage(a: number, b: number): number {
        return 100 * Math.abs( ( a - b ) / ( (a+b)/2 ) );
    }
}
