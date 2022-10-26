import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['validator_address'];

  if (!address) {
    throw new Error('No address specified or wrong address format.');
  }

  const resp = await new NodeApi(REST_API).staking_get_delegators_per_validator(
    address
  );
  const delegators_count = resp.delegation_responses.length;

  return new Response(delegators_count.toString());
}
