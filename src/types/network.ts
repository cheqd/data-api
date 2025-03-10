// Allowed Networks
export enum Network {
	MAINNET = 'mainnet',
	TESTNET = 'testnet',
}
// Used to simplify routing
export enum AnalyticsEntityType {
	DID = 'did',
	RESOURCE = 'resource',
}
// Used to simplify routing
export enum AnalyticsPathOperation {
	EXPORT = 'export',
}

// Type aliases for convenience
export type EntityType = AnalyticsEntityType.DID | AnalyticsEntityType.RESOURCE;
export type AnalyticsPathType = EntityType | AnalyticsPathOperation.EXPORT;

// Validation arrays
export const VALID_NETWORKS = Object.values(Network);
export const VALID_ENTITY_TYPES = Object.values(AnalyticsEntityType);
export const VALID_ANALYTICS_PATHS = [...VALID_ENTITY_TYPES, AnalyticsPathOperation.EXPORT];
