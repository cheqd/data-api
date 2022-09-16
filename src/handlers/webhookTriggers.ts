import { ArbitrageOpportunity, Payload } from "../types/prices";
import { fetchPrices, handler } from "./coinPrice";

export async function webhookTriggers(event: Event) {
  console.log("Triggering webhook...");
  await sendPriceDiscrepancies();
}

export async function sendPriceDiscrepancies() {
  console.log("Sending price discrepancies...");

  const prices = await fetchPrices();

  const arbitrage_oportunity = prices.arbitrage_oportunity;
  // TODO: set this to "arbitrage_oportunity"
  console.log("Arbitrage opportunities...", prices);
  if (arbitrage_oportunity) {
    try {
      const init = {
        body: JSON.stringify(prices),
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };

      await fetch(
        "https://hooks.zapier.com/hooks/catch/13375168/benkx5j/", //TODO set this back to cheqds webhook url
        init
      );
    } catch (err: any) {
      console.log(err);
    }
  }
}
