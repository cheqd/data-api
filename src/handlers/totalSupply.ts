import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';
import { ncheq_to_cheq_fixed } from '../helpers/currency';

export async function handler(request: Request): Promise<Response> {
  let nodeApi = new NodeApi(REST_API);
  let totalSupply = await nodeApi.bank_get_total_supply_ncheq();

  return new Response(ncheq_to_cheq_fixed(totalSupply));
}
