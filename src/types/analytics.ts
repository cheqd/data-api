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

export interface AnalyticsItem {
	didId?: string;
	resourceId?: string;
	resourceType?: string;
	resourceName?: string;
	operationType: string;
	feePayer: string;
	amount: number | string;
	denom: string;
	blockHeight: number;
	transactionHash: string;
	createdAt: string | Date;
	success: boolean;
}

export interface AnalyticsResponse {
	items: AnalyticsItem[]; // Changed from any[]
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}
