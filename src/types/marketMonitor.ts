export interface Price {
  price: number;
  coinPair: string;
  market: string;
}

export interface ArbitrageOpportunity {
  marketPairId: string;
  marketNameA: string;
  coinPriceA: number;
  coinPairA: string;
  marketNameB: string;
  coinPriceB: number;
  coinPairB: string;
  arbitragePossible: boolean;
  percentageDelta: number;
}

export interface MarketMonitorData {
  prices: Price[];
  arbitrageOpportunities: ArbitrageOpportunity[];
}
