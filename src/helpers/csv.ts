import { Network, EntityType } from '../types/network';
import { DrizzleClient } from '../database/client';
import { AnalyticsQueryParams } from '../types/analytics';
import { getTables, buildQueryConditions } from './analytics';
import { eq, and, desc, sql } from 'drizzle-orm';

// Convert data to CSV format
export function convertToCSV(data: Record<string, unknown>[]): string {
	if (!data || !data.length) {
		return 'No data available';
	}

	const headers = Object.keys(data[0]).join(',');
	const rows = data.map((item) =>
		Object.values(item)
			.map((value) => (typeof value === 'string' && value.includes(',') ? `"${value}"` : value))
			.join(',')
	);

	return [headers, ...rows].join('\n');
}

// Generate export filename
export function generateExportFilename(
	network: Network,
	entityType: EntityType | undefined,
	params: {
		startDate: string | null;
		endDate: string | null;
		operationType: string | null;
		didId: string | null;
		feePayer: string | null;
		denom: string | null;
		success: boolean | null;
	}
): string {
	const filenameParts = [`analytics-${network}`];

	// Add entity type if specified
	if (entityType) {
		filenameParts.push(entityType);
	}

	// Add date range description
	if (params.startDate && params.endDate) {
		filenameParts.push(`from-${params.startDate}-to-${params.endDate}`);
	} else if (params.startDate) {
		filenameParts.push(`from-${params.startDate}`);
	} else if (params.endDate) {
		filenameParts.push(`until-${params.endDate}`);
	} else {
		filenameParts.push('last-30-days');
	}

	// Add operation type if specified
	if (params.operationType) {
		filenameParts.push(params.operationType);
	}

	// Add DID ID if specified (truncated for filename length)
	if (params.didId) {
		const shortDidId =
			params.didId.length > 20
				? `${params.didId.substring(0, 10)}...${params.didId.substring(params.didId.length - 10)}`
				: params.didId;
		filenameParts.push(shortDidId);
	}

	// Add fee payer if specified (truncated)
	if (params.feePayer) {
		const shortFeePayer =
			params.feePayer.length > 20
				? `${params.feePayer.substring(0, 10)}...${params.feePayer.substring(params.feePayer.length - 10)}`
				: params.feePayer;
		filenameParts.push(shortFeePayer);
	}

	// Add denom if specified
	if (params.denom) {
		filenameParts.push(params.denom);
	}

	// Add success status if specified
	if (params.success !== null) {
		filenameParts.push(params.success ? 'success' : 'failed');
	}

	// Create final filename
	return filenameParts
		.join('-')
		.replace(/[^a-z0-9\-_.]/gi, '_') // Replace invalid chars with underscore
		.substring(0, 255); // Limit filename length
}

export function serializeBigInt<T>(data: T): T {
	return JSON.parse(JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

// Export functions
export async function exportDidAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<string> {
	const tables = getTables(network);

	// Build base conditions
	const conditions = buildQueryConditions(params, tables.did, tables.operationTypes, tables.denom);

	// Execute query without pagination
	const items = await db
		.select({
			didId: tables.did.didId,
			operationType: tables.operationTypes.friendlyOperationType,
			ledgerOperationType: tables.operationTypes.ledgerOperationType,
			feePayer: tables.did.feePayer,
			amount: sql`${tables.did.amount}::decimal / POW(10, ${tables.denom.exponent})`,
			denom: tables.denom.friendlyDenom,
			ledgerDenom: tables.denom.ledgerDenom,
			blockHeight: tables.did.blockHeight,
			transactionHash: tables.did.transactionHash,
			createdAt: tables.did.createdAt,
			success: tables.did.success,
		})
		.from(tables.did)
		.leftJoin(tables.operationTypes, eq(tables.did.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.did.denom, tables.denom.id))
		.where(and(...conditions))
		.orderBy(desc(tables.did.createdAt));

	// Convert to CSV
	return convertToCSV(serializeBigInt(items));
}

export async function exportResourceAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<string> {
	const tables = getTables(network);

	// Build base conditions
	const conditions = buildQueryConditions(params, tables.resource, tables.operationTypes, tables.denom);

	// Execute query without pagination
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
		.orderBy(desc(tables.resource.createdAt));

	// Convert to CSV
	return convertToCSV(serializeBigInt(items));
}

export async function exportAllAnalytics(
	db: DrizzleClient,
	network: Network,
	params: AnalyticsQueryParams
): Promise<string> {
	const tables = getTables(network);

	// Build conditions for DIDs
	const didConditions = buildQueryConditions(params, tables.did, tables.operationTypes, tables.denom);

	// Build conditions for Resources
	const resourceConditions = buildQueryConditions(params, tables.resource, tables.operationTypes, tables.denom);

	// Fetch DIDs
	const didItems = await db
		.select({
			didId: tables.did.didId,
			operationType: tables.operationTypes.friendlyOperationType,
			ledgerOperationType: tables.operationTypes.ledgerOperationType,
			feePayer: tables.did.feePayer,
			amount: sql`${tables.did.amount}::decimal / POW(10, ${tables.denom.exponent})`,
			denom: tables.denom.friendlyDenom,
			ledgerDenom: tables.denom.ledgerDenom,
			blockHeight: tables.did.blockHeight,
			transactionHash: tables.did.transactionHash,
			createdAt: tables.did.createdAt,
			success: tables.did.success,
		})
		.from(tables.did)
		.leftJoin(tables.operationTypes, eq(tables.did.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.did.denom, tables.denom.id))
		.where(and(...didConditions))
		.orderBy(desc(tables.did.createdAt));

	// Fetch Resources
	const resourceItems = await db
		.select({
			didId: tables.resource.didId,
			resourceId: tables.resource.resourceId,
			resourceType: tables.resource.resourceType,
			resourceName: tables.resource.resourceName,
			operationType: tables.operationTypes.friendlyOperationType,
			ledgerOperationType: tables.operationTypes.ledgerOperationType,
			feePayer: tables.resource.feePayer,
			amount: sql`${tables.resource.amount}::decimal / POW(10, ${tables.denom.exponent})`,
			denom: tables.denom.friendlyDenom,
			ledgerDenom: tables.denom.ledgerDenom,
			blockHeight: tables.resource.blockHeight,
			transactionHash: tables.resource.transactionHash,
			createdAt: tables.resource.createdAt,
			success: tables.resource.success,
		})
		.from(tables.resource)
		.leftJoin(tables.operationTypes, eq(tables.resource.operationType, tables.operationTypes.id))
		.leftJoin(tables.denom, eq(tables.resource.denom, tables.denom.id))
		.where(and(...resourceConditions))
		.orderBy(desc(tables.resource.createdAt));

	// Use different exports for different entity types so they have correct headers
	if (params.didId) {
		// If filtering by DID ID, prioritize DID exports
		const allItems = [...didItems, ...resourceItems].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
		return convertToCSV(serializeBigInt(allItems));
	} else {
		// Use only DID items with the original column structure to ensure consistent CSV headers
		const items = [...didItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		return convertToCSV(serializeBigInt(items));
	}
}
