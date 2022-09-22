export interface Market {
  name: string;
  identifier: string;
  has_trading_incentive: boolean;
}

export interface ConvertedLast {
  btc: number;
  eth: number;
  usd: number;
}

export interface ConvertedVolume {
  btc: number;
  eth: number;
  usd: number;
}

export interface Ticker {
  base: string;
  target: string;
  market: Market;
  last: number;
  volume: number;
  converted_last: ConvertedLast;
  converted_volume: ConvertedVolume;
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url?: any;
  coin_id: string;
  target_coin_id: string;
}

export interface RootObject {
  name: string;
  tickers: Ticker[];
}

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

export interface Payload {
  markets: Price[];
  arbitrage_opportunities: ArbitrageOpportunity[];
  arbitrage_opportunity: boolean;
}
