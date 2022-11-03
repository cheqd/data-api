import { NodeApi } from '../api/nodeApi';
import { Coin } from '../types/node';

export function delayed_balance_ncheq(balance: Coin[]): number {
  return Number(balance.find((c) => c.denom === 'ncheq')?.amount || '0');
}

export async function get_all_delegators_for_a_validator(
  validator_address: string
): Promise<string[]> {
  const node_api = new NodeApi(REST_API);
  let offset = 0;

  let delegationsResp = await node_api.staking_get_delegators_per_validator(
    validator_address,
    offset,
    true // we set it to true to get total_delegators_count
  );
  const total_delegators_count = Number(delegationsResp.pagination.total);
  const delegators = [];

  while (
    offset < total_delegators_count ||
    delegationsResp.delegation_responses.length > 0
  ) {
    for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
      const delegator =
        delegationsResp.delegation_responses[i].delegation.delegator_address;
      delegators.push(delegator);
    }
    offset += Number(REST_API_PAGINATION_LIMIT);
    delegationsResp = await node_api.staking_get_delegators_per_validator(
      validator_address,
      offset,
      false // we dont need to get total_count on subsequent queries
    );
    if (offset > total_delegators_count) {
      break;
    }
  }

  return delegators;
}
