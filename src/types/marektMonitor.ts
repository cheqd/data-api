export interface Price {
  price: number;
  coin_pair: string;
  market: string;
}

export interface ArbitrageOpportunity {
  market_a: Price;
  market_b: Price;
  percentage_delta: number;
}

export interface MarketMonitorData {
  prices: Price[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  hasArbitrageOpportunities: boolean;
}
