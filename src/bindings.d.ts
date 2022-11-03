declare global {
  const TOKEN_EXPONENT: number;
  const REST_API: string;
  const REST_API_PAGINATION_LIMIT: number;
  const GRAPHQL_API: string;
  const CIRCULATING_SUPPLY_WATCHLIST: KVNamespace;
  const ACTIVE_VALIDATORS: KVNamespace;
  const CIRCULATING_SUPPLY_GROUPS: number;
  const MARKET_MONITORING_API: string;
  const WEBHOOK_URL: string;
}

export {};
