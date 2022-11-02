import { Request } from 'itty-router';
import { ActiveValidatorsKV } from '../helpers/validators';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['validator_address'];

  if (!address) {
    throw new Error('No address specified or wrong address format.');
  }

  try {
    const total_delegators_from_cache =
    await try_getting_delegators_count_from_KV(address);
    if(!total_delegators_from_cache) {
      throw new Error('No delegators count cached for given validator');
    }
    return new Response(JSON.stringify(total_delegators_from_cache));
  }
  catch (error) {
    console.log(error);
    throw new Error('Error while getting delegators count for validator');
  }
}

async function try_getting_delegators_count_from_KV(validator_address: string) {
  const validator_data = ACTIVE_VALIDATORS.get(
    validator_address
  ) as ActiveValidatorsKV;

  return validator_data.totalDelegatorsCount
    ? validator_data.totalDelegatorsCount
    : null;
}
