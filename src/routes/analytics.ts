import { IRequest, Router } from 'itty-router';
import { handler as handleAnalyticsRequest } from '../handlers/analytics';
import {
	Network,
	VALID_NETWORKS,
	EntityType,
	VALID_ENTITY_TYPES,
	VALID_ANALYTICS_PATHS,
	AnalyticsPathType,
} from '../types/network';

/**
 * Registers analytics-related routes to the router
 */
export function registerAnalyticsRoutes(router: ReturnType<typeof Router>, env: Env, ctx: ExecutionContext) {
	// Base analytics endpoint
	router.get('/analytics/:network', (request: IRequest) => {
		const { network } = request.params;
		if (!VALID_NETWORKS.includes(network as Network)) {
			return new Response(
				JSON.stringify({
					error: `Invalid network. Use ${VALID_NETWORKS.join(' or ')}.`,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
		// Convert string parameter to Network enum
		const networkEnum = network === 'mainnet' ? Network.MAINNET : Network.TESTNET;
		return handleAnalyticsRequest(request, env, ctx, networkEnum);
	});

	// Network with path (did, resource, or export)
	router.get('/analytics/:network/:path', (request: IRequest) => {
		const { network, path } = request.params;
		if (!VALID_NETWORKS.includes(network as Network)) {
			return new Response(
				JSON.stringify({
					error: `Invalid network. Use ${VALID_NETWORKS.join(' or ')}.`,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Validate path
		if (!VALID_ANALYTICS_PATHS.includes(path as AnalyticsPathType)) {
			return new Response(
				JSON.stringify({
					error: `Invalid path. Use ${VALID_ANALYTICS_PATHS.join(', ')}.`,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Convert string parameter to Network enum
		const networkEnum = network === 'mainnet' ? Network.MAINNET : Network.TESTNET;

		// Handle export case
		if (path === 'export') {
			return handleAnalyticsRequest(request, env, ctx, networkEnum);
		}

		// Handle entity type case (did or resource)
		return handleAnalyticsRequest(request, env, ctx, networkEnum, path as EntityType);
	});

	// DID/DLR specific export
	router.get('/analytics/:network/:entityType/export', (request: IRequest) => {
		const { network, entityType } = request.params;
		if (!VALID_NETWORKS.includes(network as Network)) {
			return new Response(
				JSON.stringify({
					error: `Invalid network. Use ${VALID_NETWORKS.join(' or ')}.`,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
			return new Response(
				JSON.stringify({
					error: `Invalid entity type. Use ${VALID_ENTITY_TYPES.join(' or ')}.`,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Convert string parameter to Network enum
		const networkEnum = network === 'mainnet' ? Network.MAINNET : Network.TESTNET;
		return handleAnalyticsRequest(request, env, ctx, networkEnum, entityType as EntityType);
	});
}
