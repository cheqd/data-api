import { updateGroupBalances } from '../helpers/balanceGroup';
import {
  add_new_active_validators_to_kv,
  remove_any_jailed_validators_from_kv,
  update_delegator_to_validators_KV,
} from '../helpers/totalDelegators';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: Event) {
  console.log('Triggering webhook...');
  await sendPriceDiscrepancies();
  await updateGroupBalances(getRandomGroup(CIRCULATING_SUPPLY_GROUPS));
  await add_new_active_validators_to_kv();
  await remove_any_jailed_validators_from_kv();
  await update_delegator_to_validators_KV(
    getRandomGroup(ACTIVE_VALIDATOR_GROUPS)
  );
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

function getRandomGroup(group: number): number {
  let min = 1;
  let max = Math.floor(group);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
