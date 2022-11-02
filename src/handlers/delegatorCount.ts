import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';
import { ActiveValidatorsKV } from '../helpers/totalDelegators';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['validator_address'];

  if (!address) {
    throw new Error('No address specified or wrong address format.');
  }

  const total_delegators_from_cache =
    await try_getting_delegators_count_from_KV(address);
  if (total_delegators_from_cache) {
    return new Response(total_delegators_from_cache.toString());
  }

  const node_api = new NodeApi(REST_API);
  const resp = await node_api.staking_get_delegators_per_validator(
    address,
    0,
    true
  );

  const total_delegators = resp.pagination.total;

  return new Response(total_delegators.toString());
}

async function try_getting_delegators_count_from_KV(validator_address: string) {
  const validator_data = ACTIVE_VALIDATORS.get(
    validator_address
  ) as ActiveValidatorsKV;

  return validator_data.totalDelegatorsCount
    ? validator_data.totalDelegatorsCount
    : null;
}
