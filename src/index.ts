import { Router, IRequest } from 'itty-router';
import { handler as totalSupplyHandler } from './handlers/totalSupply';
import { handler as totalBalanceHandler } from './handlers/totalBalance';
import { handler as circulatingSupplyHandler } from './handlers/circulatingSupply';
import { handler as liquidBalanceHandler } from './handlers/liquidBalance';
import { handler as vestingBalanceHandler } from './handlers/vestingBalance';
import { handler as vestedBalanceHandler } from './handlers/vestedBalance';
import { handler as totalStakedCoinsHandler } from './handlers/totalStakedCoins';
import { handler as allArbitrageOpportunitiesHandler } from './handlers/allArbitrageOpportunities';
import { handler as arbitrageOpportunitiesHandler } from './handlers/arbitrageOpportunities';
import { webhookTriggers } from './handlers/webhookTriggers';

function registerRoutes(router: ReturnType<typeof Router>, env: Env) {
	router.get('/', (request) => totalSupplyHandler(request, env));
	router.get('/arbitrage', (request) => arbitrageOpportunitiesHandler(request, env));
	router.get('/arbitrage/all', (request) => allArbitrageOpportunitiesHandler(request, env));
	router.get('/balances/liquid/:address', (request) => liquidBalanceHandler(request, env));
	router.get('/balances/total/:address', (request) => totalBalanceHandler(request, env));
	router.get('/balances/vested/:address', (request) => vestedBalanceHandler(request, env));
	router.get('/balances/vesting/:address', (request) => vestingBalanceHandler(request, env));
	router.get('/supply/circulating', (request) => circulatingSupplyHandler(request, env));
	router.get('/supply/staked', (request) => totalStakedCoinsHandler(request, env));
	router.get('/supply/total', (request) => totalSupplyHandler(request, env));

	// 404 for all other requests
	router.all('*', () => new Response('Not Found.', { status: 404 }));
}

function handleError(error: Error): Response {
	return new Response(error.message || 'Server Error', { status: 500 });
}

export default {
	async fetch(request: IRequest, env: Env, ctx: ExecutionContext) {
		const router = Router();
		registerRoutes(router, env);
		return router.handle(request).catch((error) => handleError(error));
	},
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		return await webhookTriggers(env);
	}
};
