import { MarketMonitorData } from "../types/marektMonitor";
export class MarketMonitorApi {
  constructor(public readonly base_market_monitor_api_url: string) {}

  async get_market_monitor_data(): Promise<MarketMonitorData> {
    const requestOptions = {
      method: "GET",
    };
    const response = await fetch(
      `${this.base_market_monitor_api_url}/arbitrage`,
      requestOptions
    );
    return (await response.json()) as MarketMonitorData;
  }
}
