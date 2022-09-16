import { ArbitrageOpportunity, Price, RootObject } from "../types/prices";

export class CoinGeckoApi {
  constructor(public readonly base_coingecko_api_url: string) {}

  async get_coingecko_data(): Promise<RootObject> {
    let respJson: RootObject = {
      name: "",
      tickers: [],
    };
    try {
      let resp = await fetch(
        `${this.base_coingecko_api_url}/coins/cheqd-network/tickers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      //   respJson = (await resp.json()) as RootObject;
      respJson = (await resp.json()) as RootObject;

      console.log("coingecko data", respJson);
    } catch (err) {
      console.log(`error in coingeco `);
      console.log(err);
    }
    return respJson;
  }

  calculate_difference_percentage(a: number, b: number): number {
    return 100 * Math.abs((a - b) / ((a + b) / 2));
  }

  arbitrage_opportunities(prices: Price[]): ArbitrageOpportunity[] {
    const arbitrage_percentage = 4; //TODO: change tis using ENVvar bc were going to use different for differnt env
    var arbitrage_opportunities: ArbitrageOpportunity[] = [];

    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const percentage_delta = this.calculate_difference_percentage(
          prices[i].price,
          prices[j].price
        );
        if (percentage_delta > arbitrage_percentage) {
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
