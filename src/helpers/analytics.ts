import { and, eq, gte, lte, count, desc, sql, ilike } from 'drizzle-orm';
import {
	didMainnet,
	didTestnet,
	resourceMainnet,
	resourceTestnet,
	operationTypesMainnet,
	operationTypesTestnet,
	denomMainnet,
	denomTestnet,
} from '../database/schema';
import { AnalyticsQueryParams, AnalyticsResponse } from '../types/analytics';
import { DrizzleClient } from '../database/client';
import { serializeBigInt } from './csv';
import { Network } from '../types/network';
import { validateDateRange } from './validate';

export const DEFAULT_LIMIT = 100;

// Network-based table mapping
export function getTables(network: Network) {
	return {
		did: network === Network.MAINNET ? didMainnet : didTestnet,
		resource: network === Network.MAINNET ? resourceMainnet : resourceTestnet,
		operationTypes: network === Network.MAINNET ? operationTypesMainnet : operationTypesTestnet,
		denom: network === Network.MAINNET ? denomMainnet : denomTestnet,
	};
}

// Build query conditions
export function buildQueryConditions(
	params: AnalyticsQueryParams,
	table: typeof didMainnet | typeof didTestnet | typeof resourceMainnet | typeof resourceTestnet,
	operationTypesTable: typeof operationTypesMainnet | typeof operationTypesTestnet,
	denomTable: typeof denomMainnet | typeof denomTestnet
) {
	const conditions = [];

	// Get validated date range
	const { start, end } = validateDateRange(params.startDate, params.endDate);
	conditions.push(gte(table.createdAt, start));
	conditions.push(lte(table.createdAt, end));

	// Add conditions with case-insensitive comparison
	if (params.feePayer !== null) {
		conditions.push(eq(table.feePayer, params.feePayer));
	}

	if (params.didId !== null) {
		conditions.push(ilike(table.didId, params.didId));
	}

	if (params.success !== null) {
		conditions.push(eq(table.success, params.success));
	}

	if (params.operationType !== null) {
		conditions.push(ilike(operationTypesTable.friendlyOperationType, params.operationType));
	}

	if (params.ledgerOperationType !== null) {
		conditions.push(ilike(operationTypesTable.ledgerOperationType, params.ledgerOperationType));
	}

	if (params.ledgerDenom !== null) {
		conditions.push(ilike(denomTable.ledgerDenom, params.ledgerDenom));
	}

	if (params.denom !== null) {
		conditions.push(ilike(denomTable.friendlyDenom, params.denom));
	}

	return conditions;
}

// Format response
function formatResponse(items: any[], totalCount: number, params: AnalyticsQueryParams): AnalyticsResponse {
	return {
		items: serializeBigInt(items),
		totalCount,
		page: params.page || 1,
		limit: params.limit || DEFAULT_LIMIT,
		totalPages: Math.ceil(totalCount / (params.limit || DEFAULT_LIMIT)),
	};
}

// Calculate pagination offset
function getPaginationOffset(params: AnalyticsQueryParams): number {
	return ((params.page || 1) - 1) * (params.limit || DEFAULT_LIMIT);
}

// Fetch both DIDs and DLRs
export async function fetchAllAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<AnalyticsResponse> {
	// Override pagination to get count
	const didParams = { ...params, page: 1, limit: Number.MAX_SAFE_INTEGER };
	const resourceParams = { ...params, page: 1, limit: Number.MAX_SAFE_INTEGER };

	// Fetch both DIDs and DLRs
	const didResults = await fetchDidAnalytics(db, network, didParams);
	const resourceResults = await fetchResourceAnalytics(db, network, resourceParams);

	// Calculate total count
	const totalCount = didResults.totalCount + resourceResults.totalCount;

	// Combine and sort all items
	const allItems = [...didResults.items, ...resourceResults.items].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	// Apply pagination to combined results
	const offset = getPaginationOffset(params);
	const paginatedItems = allItems.slice(offset, offset + (params.limit || DEFAULT_LIMIT));

	return formatResponse(paginatedItems, totalCount, params);
}

export async function fetchDidAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<AnalyticsResponse> {
	const tables = getTables(network);

	// Build base conditions with network
	const conditions = buildQueryConditions(params, tables.did, tables.operationTypes, tables.denom);

	// Calculate pagination
	const offset = getPaginationOffset(params);

	const items = await db
		.select({
			didId: tables.did.didId,
			operationType: tables.operationTypes.friendlyOperationType,
			feePayer: tables.did.feePayer,
			amount: sql`${tables.did.amount}::decimal / POW(10, ${tables.denom.exponent})`,
			denom: tables.denom.friendlyDenom,
			blockHeight: tables.did.blockHeight,
			transactionHash: tables.did.transactionHash,
			createdAt: tables.did.createdAt,
			success: tables.did.success,
		})
		.from(tables.did)
		.leftJoin(tables.operationTypes, eq(tables.did.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.did.denom, tables.denom.id))
		.where(and(...conditions))
		.orderBy(desc(tables.did.createdAt))
		.limit(params.limit || DEFAULT_LIMIT)
		.offset(offset);

	// Count query needs to join the same tables if we're filtering by operation type
	const totalCount = await db
		.select({
			value: count(),
		})
		.from(tables.did)
		.leftJoin(tables.operationTypes, eq(tables.did.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.did.denom, tables.denom.id))
		.where(and(...conditions))
		.then((result) => result[0].value);

	return formatResponse(items, totalCount, params);
}

export async function fetchResourceAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<AnalyticsResponse> {
	const tables = getTables(network);

	// Build base conditions with network
	const conditions = buildQueryConditions(params, tables.resource, tables.operationTypes, tables.denom);

	// Calculate pagination
	const offset = getPaginationOffset(params);

	const items = await db
		.select({
			resourceId: tables.resource.resourceId,
			resourceType: tables.resource.resourceType,
			resourceName: tables.resource.resourceName,
			operationType: tables.operationTypes.friendlyOperationType,
			didId: tables.resource.didId,
			feePayer: tables.resource.feePayer,
			amount: sql`${tables.resource.amount}::decimal / POW(10, ${tables.denom.exponent})`,
			denom: tables.denom.friendlyDenom,
			blockHeight: tables.resource.blockHeight,
			transactionHash: tables.resource.transactionHash,
			createdAt: tables.resource.createdAt,
			success: tables.resource.success,
		})
		.from(tables.resource)
		.leftJoin(tables.operationTypes, eq(tables.resource.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.resource.denom, tables.denom.id))
		.where(and(...conditions))
		.orderBy(desc(tables.resource.createdAt))
		.limit(params.limit || DEFAULT_LIMIT)
		.offset(offset);

	// Count query
	const totalCount = await db
		.select({
			value: count(),
		})
		.from(tables.resource)
		.leftJoin(tables.operationTypes, eq(tables.resource.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.resource.denom, tables.denom.id))
		.where(and(...conditions))
		.then((result) => result[0].value);

	return formatResponse(items, totalCount, params);
}
