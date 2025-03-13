import { Router, IRequest } from 'itty-router';
import { handler as totalSupplyHandler } from './handlers/totalSupply';
import { handler as totalBalanceHandler } from './handlers/totalBalance';
import { handler as circulatingSupplyHandler } from './handlers/circulatingSupply';
import { handler as liquidBalanceHandler } from './handlers/liquidBalance';
import { handler as vestingBalanceHandler } from './handlers/vestingBalance';
import { handler as vestedBalanceHandler } from './handlers/vestedBalance';
import { handler as totalStakedCoinsHandler } from './handlers/totalStakedCoins';
import { webhookTriggers } from './handlers/webhookTriggers';
import { registerAnalyticsRoutes } from './routes/analytics';

function registerRoutes(router: ReturnType<typeof Router>, env: Env, ctx: ExecutionContext) {
	router.get('/', () => totalSupplyHandler(env));
	router.get('/balances/liquid/:address', (request) => liquidBalanceHandler(request, env));
	router.get('/balances/total/:address', (request) => totalBalanceHandler(request, env));
	router.get('/balances/vested/:address', (request) => vestedBalanceHandler(request, env));
	router.get('/balances/vesting/:address', (request) => vestingBalanceHandler(request, env));
	router.get('/supply/circulating', () => circulatingSupplyHandler(env));
	router.get('/supply/staked', () => totalStakedCoinsHandler(env));
	router.get('/supply/total', () => totalSupplyHandler(env));

	// Register analytics routes
	registerAnalyticsRoutes(router, env, ctx);

	// 404 for all other requests
	router.all('*', () => new Response('Not Found.', { status: 404 }));
}

function handleError(error: Error): Response {
	return new Response(error.message || 'Server Error', { status: 500 });
}

export default {
	async fetch(request: IRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
		const router = Router();
		registerRoutes(router, env, ctx);
		return router.handle(request).catch((error) => handleError(error));
	},
	async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
		return await webhookTriggers(env);
	},
};
