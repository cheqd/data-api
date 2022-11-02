import { updateCirculatingSupply } from '../helpers/circulating';
import { updateValidatorKV } from '../helpers/validators';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: Event) {
  console.log('Triggering webhook...');
  await sendPriceDiscrepancies();
  await updateCirculatingSupply(getRandomGroup(Number(CIRCULATING_SUPPLY_GROUPS)));
  await de
  
  const gql_client = new GraphQLClient(GRAPHQL_API);
  const bd_api = new BigDipperApi(gql_client);
  const active_validators_resp = await bd_api.get_active_validators();

  await remove_any_jailed_validators_from_kv(active_validators_resp);
  // also set total delegator count for a validator
  await update_delegator_to_validators_KV(
    getRandomGroup(Number(ACTIVE_VALIDATOR_GROUPS))
  );
  await add_new_active_validators_to_kv(active_validators_resp);
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
