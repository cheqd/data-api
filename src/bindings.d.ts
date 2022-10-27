declare global {
  const TOKEN_EXPONENT: number;
  const REST_API: string;
  const GRAPHQL_API: string;
  const CIRCULATING_SUPPLY_WATCHLIST: KVNamespace;
  const ACTIVE_VALIDATORS: KVNamespace;
  const TOTAL_DELEGATORS: KVNamespace;
  const CIRCULATING_SUPPLY_GROUPS: number;
  const MARKET_MONITORING_API: string;
  const WEBHOOK_URL: string;
}

export {};
