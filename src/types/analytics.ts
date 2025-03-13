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
export interface DidAnalyticsItem extends BaseAnalyticsItem {
	didId: string;
}

// Resource-specific analytics item
export interface ResourceAnalyticsItem extends BaseAnalyticsItem {
	didId?: string;
	resourceId: string;
	resourceType: string;
	resourceName: string;
}

// Combined type for analytics items
export type AnalyticsItem = DidAnalyticsItem | ResourceAnalyticsItem;

// For CSV export with combined items
export interface ExportAnalyticsItem extends BaseAnalyticsItem {
	type?: string;
	id?: string;
	didId: string | null;
	resourceId?: string | null;
	resourceType?: string | null;
	resourceName?: string | null;
}

export interface AnalyticsResponse {
	items: AnalyticsItem[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}
