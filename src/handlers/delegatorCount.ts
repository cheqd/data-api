import { Request } from 'itty-router';
import { get_all_delegators_for_a_validator } from '../helpers/node';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['validator_address'];

  if (!address) {
    throw new Error('No address specified or wrong address format.');
  }

  const resp = await get_all_delegators_for_a_validator(address);
  const delegators_count = resp.length;

  return new Response(delegators_count.toString());
}
