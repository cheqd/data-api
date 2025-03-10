export interface AnalyticsQueryParams {
	startDate: string | null;
	endDate: string | null;
	operationType: string | null;
	feePayer: string | null;
	didId: string | null;
	denom: string | null;
	success: boolean | null;
	page: number;
	limit: number;
}

export interface AnalyticsResponse {
	items: any[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}
