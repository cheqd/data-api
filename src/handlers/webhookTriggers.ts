import { fetchPrices } from "./coinPrice";

export async function webhookTriggers(event: Event) {
  console.log("Triggering webhook...");
  await sendPriceDiscrepancies();
}

export async function sendPriceDiscrepancies() {
  console.log("Sending price discrepancies...");

  const prices = await fetchPrices();

  const has_arbitrage_opportunity = prices.arbitrage_opportunity;
  if (has_arbitrage_opportunity) {
    console.log("Arbitrage opportunities...");
    try {
      const init = {
        body: JSON.stringify({
          arbitrage_opportunities: prices.arbitrage_opportunities,
        }),
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };

      await fetch(WEBHOOK_URL, init);
    } catch (err: any) {
      console.log(err);
    }
  }
}
