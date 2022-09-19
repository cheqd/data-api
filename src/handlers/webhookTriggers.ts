import { fetchPrices } from "./coinPrice";

export async function webhookTriggers() {
  console.log("Triggering webhook...");
  await sendPriceDiscrepancies();
}

export async function sendPriceDiscrepancies() {
  console.log("Sending price discrepancies...");

  const prices = await fetchPrices();

  const has_arbitrage_oportunity = prices.arbitrage_oportunity;
  if (has_arbitrage_oportunity) {
    console.log("Arbitrage opportunities...");
    try {
      const init = {
        body: JSON.stringify({
          arbitrage_oportunities: prices.arbitrage_oportunities,
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
