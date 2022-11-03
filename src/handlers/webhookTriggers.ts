import { updateCirculatingSupply } from '../helpers/circulating';
import { updateActiveValidatorsKV } from '../helpers/validators';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: Event) {
  console.log('Triggering webhook...');
  await sendPriceDiscrepancies(); // removed to test

  await updateCirculatingSupply(
    getRandomGroup(Number(CIRCULATING_SUPPLY_GROUPS))
  );
  await updateActiveValidatorsKV();
}

export async function sendPriceDiscrepancies() {
  try {
    console.log('Sending price discrepancies...');

    const arbitrageOpportunities = await filterArbitrageOpportunities();
    const hasArbitrageOpportunities = arbitrageOpportunities.length > 0;
    if (hasArbitrageOpportunities) {
      console.log('Arbitrage opportunities...');
      try {
        const init = {
          body: JSON.stringify({
            arbitrage_opportunities: arbitrageOpportunities,
          }),
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=UTF-8',
          },
        };

        await fetch(WEBHOOK_URL, init);
      } catch (err: any) {
        console.log(err);
      }
    }
  } catch (e) {
    console.log('Error at: ', 'sendPriceDiscrepancies');
  }
}

function getRandomGroup(group: number): number {
  let min = 1;
  let max = Math.floor(group);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
