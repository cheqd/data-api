declare global {
    interface Env {
      // Environment variables
      TOKEN_EXPONENT: number;
      REST_API: string;
      REST_API_PAGINATION_LIMIT: string;
      GRAPHQL_API: string;
      CIRCULATING_SUPPLY_GROUPS: string;
      MARKET_MONITORING_API: string;
      WEBHOOK_URL: string;
      
      // Bindings
      CIRCULATING_SUPPLY_WATCHLIST: KVNamespace;
    }
  
    interface ScheduledController {
      scheduledTime: number;
      cron: string;
      noRetry: () => void;
    }
  
    interface ExecutionContext {
      waitUntil(promise: Promise<any>): void;
      passThroughOnException(): void;
    }
  }
  
  // This export is needed to make this a module
  export {}; 