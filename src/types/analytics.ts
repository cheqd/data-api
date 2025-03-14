export interface AnalyticsQueryParams {
	startDate: string | null;
	endDate: string | null;
	operationType: string | null;
	ledgerOperationType: string | null;
	feePayer: string | null;
	didId: string | null;
	denom: string | null;
	ledgerDenom: string | null;
	success: boolean | null;
	page: number;
	limit: number;
}

// Base interface for common analytics item properties
export interface BaseAnalyticsItem {
	operationType: string;
	feePayer: string;
	amount: string | number;
	denom: string;
	blockHeight: bigint | number;
	transactionHash: string;
	createdAt: Date | string;
	success: boolean;
}

// DID-specific analytics item
export interface DidAnalyticsItem {
	didId: string;
	operationType: string | null;
	feePayer: string;
	amount: unknown;
	denom: string | null;
	blockHeight: bigint;
	transactionHash: string;
	createdAt: Date;
	success: boolean;
}

// Resource-specific analytics item
export interface ResourceAnalyticsItem {
	resourceId: string;
	resourceType: string;
	resourceName: string;
	operationType: string | null;
	didId: string | null;
	feePayer: string;
	amount: unknown;
	denom: string | null;
	blockHeight: bigint;
	transactionHash: string;
	createdAt: Date;
	success: boolean;
}

// Combined type for analytics items
export type AnalyticsItem = DidAnalyticsItem | ResourceAnalyticsItem;

export interface AnalyticsResponse {
	items: AnalyticsItem[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}
