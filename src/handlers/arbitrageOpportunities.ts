import { MarketMonitorApi } from '../api/marketMonitorApi';
import { ArbitrageOpportunity } from '../types/marketMonitor';

async function fetchPrices() {
	let market_monitor_api = new MarketMonitorApi(`${MARKET_MONITORING_API}`);
	return await market_monitor_api.getMarketMonitoringData();
}

export async function filterArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
	const payload = await fetchPrices();
	const arbitrage_opportunities = [];
	for (let i = 0; i < payload.arbitrageOpportunities.length; i++) {
		if (payload.arbitrageOpportunities[i].arbitragePossible) {
			arbitrage_opportunities.push(payload.arbitrageOpportunities[i]);
		}
	}
	return arbitrage_opportunities;
}
export async function handler(request: Request): Promise<Response> {
	const arbitrage_opportunities = await filterArbitrageOpportunities();
	return new Response(JSON.stringify(arbitrage_opportunities, null, 2), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}
