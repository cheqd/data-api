import { MarketMonitorData } from '../types/marketMonitor';
export class MarketMonitorApi {
  constructor(public readonly base_market_monitor_api_url: string) {}

  async getMarketMonitoringData(): Promise<MarketMonitorData> {
    const requestOptions = {
      method: 'GET',
    };
    const response = await fetch(
      `${this.base_market_monitor_api_url}`,
      requestOptions
    );
    return (await response.json()) as MarketMonitorData;
  }
}
