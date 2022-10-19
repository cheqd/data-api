import { updateGroupBalances } from '../helpers/balanceGroup';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: Event) {
  console.log('Triggering webhook...');
  await sendPriceDiscrepancies();
  await updateGroupBalances(getRandomGroup());
}

export async function sendPriceDiscrepancies() {
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
}

function getRandomGroup(): number {
  const hour = new Date().getHours();

  if (hour > 0 && hour < 6) {
    return 1;
  }

  if (hour >= 6 && hour < 12) {
    return 2;
  }

  if (hour >= 12 && hour < 18) {
    return 3;
  }

  if (hour >= 18 && hour < 24) {
    return 4;
  }
  throw new Error('invalid hour for group');
}
