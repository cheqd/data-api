import { MarketMonitorData } from "../types/marketMonitor";
export class MarketMonitorApi {
  constructor(public readonly base_market_monitor_api_url: string) {}

  async get_market_monitor_data(): Promise<MarketMonitorData> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append(
      "Authorization",
      `Basic ${MONITOR_MARKET_API_FUNCTIONS_ACCESS_TOKEN}`
    );

    const requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
    };
    const response = await fetch(
      `${this.base_market_monitor_api_url}/coingecko-tickers/arbitrage?blocking=true&result=true`,
      requestOptions
    );
    return (await response.json()) as MarketMonitorData;
  }
}
