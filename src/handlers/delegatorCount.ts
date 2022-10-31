import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['validator_address'];

  if (!address) {
    throw new Error('No address specified or wrong address format.');
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
