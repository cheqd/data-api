export interface Price {
  price: number;
  coin_pair: string;
  market: string;
}

export interface ArbitrageOpportunity {
  market_pair_id: string;
  market_name_a: string;
  coin_price_a: number;
  coin_pair_a: string;
  market_name_b: string;
  coin_price_b: number;
  coin_pair_b: string;
  arbitragePossible: boolean;
  percentage_delta: number;
}

export interface MarketMonitorData {
  prices: Price[];
  arbitrageOpportunities: ArbitrageOpportunity[];
}
