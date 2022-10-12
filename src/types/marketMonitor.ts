export interface Price {
  price: number;
  coinPair: string;
  market: string;
}

export interface ArbitrageOpportunity {
  marketPairId: string;
  marketName1: string;
  coinPair1: string;
  coinPrice1: number;
  marketName2: string;
  coinPair2: string;
  coinPrice2: number;
  percentageDelta: number;
  arbitragePossible: boolean;
}

export interface MarketMonitorData {
  prices: Price[];
  arbitrageOpportunities: ArbitrageOpportunity[];
}
