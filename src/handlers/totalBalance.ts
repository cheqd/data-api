import { Request } from 'itty-router';
import { NodeApi } from '../api/nodeApi';
import { get_account_balance_infos } from '../helpers/balance';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];
  const node_api = new NodeApi(REST_API);
  const account_balance_infos = await get_account_balance_infos(
    node_api,
    address!!
  );

  return new Response(account_balance_infos.totalBalance.toString());
}
