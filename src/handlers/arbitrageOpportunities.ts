import { MarketMonitorApi } from '../api/marketMonitorApi';
import { ArbitrageOpportunity } from '../types/marketMonitor';
import { IRequest } from 'itty-router';

async function fetchPrices(env: Env) {
	let market_monitor_api = new MarketMonitorApi(`${env.MARKET_MONITORING_API}`);
	return await market_monitor_api.getMarketMonitoringData();
}

export async function filterArbitrageOpportunities(env: Env): Promise<ArbitrageOpportunity[]> {
	const payload = await fetchPrices(env);
	const arbitrage_opportunities = [];
	for (let i = 0; i < payload.arbitrageOpportunities.length; i++) {
		if (payload.arbitrageOpportunities[i].arbitragePossible) {
			arbitrage_opportunities.push(payload.arbitrageOpportunities[i]);
		}
	}
	return arbitrage_opportunities;
}
export async function handler(request: IRequest, env: Env): Promise<Response> {
	const arbitrage_opportunities = await filterArbitrageOpportunities(env);
	return new Response(JSON.stringify(arbitrage_opportunities, null, 2), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}
