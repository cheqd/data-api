import { MarketMonitorApi } from "../api/marketMonitorApi";

export async function fetchPrices() {
  let market_monitor_api = new MarketMonitorApi(
    `${MARKET_MONITORING_API}`
  );
  return await market_monitor_api.get_market_monitor_data();
}
export async function handler(request: Request): Promise<Response> {
  const payload = await fetchPrices();
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
