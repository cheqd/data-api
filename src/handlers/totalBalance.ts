import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';
import { calculate_total_balance_for_an_account } from '../helpers/balance';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];
  const node_api = new NodeApi(REST_API);
  const total_balance = await calculate_total_balance_for_an_account(
    node_api,
    address!!
  );

  return new Response(total_balance.toString());
}
