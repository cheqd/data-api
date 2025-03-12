import { IRequest } from 'itty-router';
import { dbInit, dbClose } from '../database/client';
import { fetchDidAnalytics, fetchResourceAnalytics, fetchAllAnalytics } from '../helpers/analytics';
import { exportAllAnalytics, exportResourceAnalytics, exportDidAnalytics } from '../helpers/csv';
import { validateDateRange, ValidationError, validateFeePayer, validateDidId } from '../helpers/validate';
import { generateExportFilename } from '../helpers/csv';
import { AnalyticsQueryParams } from '../types/analytics';
import { OperationTypes, DenomTypes, FriendlyOperationType } from '../types/bigDipper';
import { Network, EntityType } from '../types/network';

function validateQueryParams(params: AnalyticsQueryParams, network: Network): { isValid: boolean; error?: string } {
	try {
		// Validate dates
		if (params.startDate || params.endDate) {
			validateDateRange(params.startDate, params.endDate);
		}

		// Validate operation type
		if (params.ledgerOperationType) {
			const ledgerOpType = params.ledgerOperationType.trim().toLowerCase();
			const allowedTypes = Object.values(OperationTypes).map((t) => t.toLowerCase());

			if (!allowedTypes.includes(ledgerOpType)) {
				return {
					isValid: false,
					error: `Invalid operation type: ${params.ledgerOperationType}. Valid types: ${Object.values(OperationTypes).join(', ')}`,
				};
			}
		}

		// Validate operation type (simple string check with allowed values)
		if (params.operationType) {
			const opType = params.operationType.trim().toLowerCase();
			const allowedTypes = Object.values(FriendlyOperationType).map((t) => t.toLowerCase());

			if (!allowedTypes.includes(opType)) {
				return {
					isValid: false,
					error: `Invalid operation type: ${params.operationType}. Valid types: ${Object.values(FriendlyOperationType).join(', ')}`,
				};
			}
		}

		// Validate Ledger denom
		if (params.ledgerDenom) {
			const ledgerDenom = params.ledgerDenom.trim().toLowerCase();
			const allowedDenoms = Object.values(DenomTypes).map((d) => d.toLowerCase());

			if (!allowedDenoms.includes(ledgerDenom)) {
				return {
					isValid: false,
					error: `Invalid denom: ${params.ledgerDenom}. Allowed values: ${Object.values(DenomTypes).join(', ')}`,
				};
			}
		}

		// Validate denom (simple string check)
		if (params.denom) {
			const denom = params.denom.trim();
			if (!denom) {
				return {
					isValid: false,
					error: 'Denom cannot be empty',
				};
			}
		}

		// Validate fee payer
		if (params.feePayer) {
			if (!validateFeePayer(params.feePayer)) {
				return {
					isValid: false,
					error: 'Invalid fee payer address. Must start with "cheqd1" and be 44 characters long.',
				};
			}
		}

		// Validate DID ID
		if (params.didId) {
			if (!validateDidId(params.didId, network)) {
				return {
					isValid: false,
					error: `Invalid DID ID format. Must be did:cheqd:${network === Network.MAINNET ? 'mainnet' : 'testnet'}:<identifier>`,
				};
			}
		}

		return { isValid: true };
	} catch (error) {
		if (error instanceof ValidationError) {
			return { isValid: false, error: error.message };
		}
		throw error;
	}
}

function parseQueryParams(url: URL): AnalyticsQueryParams {
	// Case-insensitive parameter lookup helper
	const getParam = (name: string): string | null => {
		// Try exact match first
		if (url.searchParams.has(name)) {
			return url.searchParams.get(name);
		}

		// Try case-insensitive match
		for (const [key, value] of url.searchParams.entries()) {
			if (key.toLowerCase() === name.toLowerCase()) {
				return value;
			}
		}

		return null;
	};

	const hasParam = (name: string): boolean => {
		// Try exact match first
		if (url.searchParams.has(name)) {
			return true;
		}

		// Try case-insensitive match
		for (const key of url.searchParams.keys()) {
			if (key.toLowerCase() === name.toLowerCase()) {
				return true;
			}
		}

		return false;
	};

	return {
		startDate: getParam('startDate'),
		endDate: getParam('endDate'),
		operationType: getParam('operationType'),
		ledgerOperationType: getParam('ledgerOperationType'),
		feePayer: getParam('feePayer'),
		didId: getParam('didId'),
		denom: getParam('denom'),
		ledgerDenom: getParam('ledgerDenom'),
		success: hasParam('success') ? getParam('success') === 'true' : null,
		page: hasParam('page') ? parseInt(getParam('page') || '1', 10) : 1,
		limit: hasParam('limit') ? parseInt(getParam('limit') || '100', 10) : 100,
	};
}

export async function handler(
	request: IRequest,
	env: Env,
	ctx: ExecutionContext,
	network: Network,
	entityType?: EntityType
): Promise<Response> {
	let dbInstance = null;
	const url = new URL(request.url);

	try {
		const params = parseQueryParams(url);
		const isExport = url.pathname.endsWith('/export');

		// Validate parameters
		const validation = validateQueryParams(params, network);
		if (!validation.isValid) {
			return new Response(JSON.stringify({ error: validation.error }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Initialize database connection
		dbInstance = await dbInit(env);
		const { db } = dbInstance;

		// For exports, use special export functions that don't use pagination
		if (isExport) {
			let csvData;
			if (entityType === undefined) {
				csvData = await exportAllAnalytics(db, network, params);
			} else if (entityType === 'resource') {
				csvData = await exportResourceAnalytics(db, network, params);
			} else {
				csvData = await exportDidAnalytics(db, network, params);
			}

			// Generate a descriptive filename
			const filename = generateExportFilename(network, entityType, params);

			return new Response(csvData, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="${filename}.csv"`,
				},
			});
		}

		// For regular API requests, use the paginated functions
		const data =
			entityType === undefined
				? await fetchAllAnalytics(db, network, params)
				: entityType === 'resource'
					? await fetchResourceAnalytics(db, network, params)
					: await fetchDidAnalytics(db, network, params);

		return new Response(JSON.stringify(data), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		console.error(`Error in analytics endpoint: ${error}`);
		const errorMessage = error instanceof Error ? error.message : 'Internal server error';
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	} finally {
		if (dbInstance) {
			await dbClose(dbInstance);
		}
	}
}
