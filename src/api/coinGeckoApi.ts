import { ArbitrageOpportunity, Price, RootObject } from "../types/prices";

export class CoinGeckoApi {
  constructor(public readonly base_coingecko_api_url: string) {}

  async get_coingecko_data(): Promise<RootObject> {
    let request_url =
      this.base_coingecko_api_url + "/coins/" + COINGECKO_ID + "/tickers";
    let request_headers = {
      headers: {
        accept: "*/*",
        "user-agent": "curl/7.79.1",
      },
    };
    let response = await fetch(request_url, request_headers);
    return (await response.json()) as RootObject;
  }

  calculate_difference_percentage(a: number, b: number): number {
    return 100 * Math.abs((a - b) / ((a + b) / 2));
  }

  arbitrage_opportunities(prices: Price[]): ArbitrageOpportunity[] {
    var arbitrage_opportunities: ArbitrageOpportunity[] = [];

    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const percentage_delta = this.calculate_difference_percentage(
          prices[i].price,
          prices[j].price
        );
        if (percentage_delta > MARKET_ARBITRAGE_THRESHOLD) {
          arbitrage_opportunities.push({
            market_a: prices[i],
            market_b: prices[j],
            percentage_delta: percentage_delta,
          });
        }
      }
    }
    return arbitrage_opportunities;
  }
}
