declare global {
	interface Env {
		// Environment variables
		TOKEN_EXPONENT: number;
		REST_API: string;
		REST_API_PAGINATION_LIMIT: string;
		GRAPHQL_API: string;
		TESTNET_GRAPHQL_API: string;
		CIRCULATING_SUPPLY_GROUPS: string;
		ENVIRONMENT: string;
		BIGDIPPER_URL: string;
		WEBHOOK_URL: string;

		// Bindings
		HYPERDRIVE: Hyperdrive;
		CIRCULATING_SUPPLY_WATCHLIST: KVNamespace;
	}

	interface ScheduledController {
		scheduledTime: number;
		cron: string;
		noRetry: () => void;
	}

	interface ExecutionContext {
		waitUntil(promise: Promise<unknown>): void;
		passThroughOnException(): void;
	}
}

// This export is needed to make this a module
export {};
