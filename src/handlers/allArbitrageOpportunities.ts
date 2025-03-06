import { MarketMonitorApi } from '../api/marketMonitorApi';
import { IRequest } from 'itty-router';

export async function fetchPrices(env: Env) {
	let market_monitor_api = new MarketMonitorApi(env.MARKET_MONITORING_API);
	return await market_monitor_api.getMarketMonitoringData();
}
export async function handler(request: IRequest, env: Env): Promise<Response> {
	const payload = await fetchPrices(env);
	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}
