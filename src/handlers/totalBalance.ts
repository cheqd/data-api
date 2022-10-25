import { Request } from 'itty-router';
import { get_account_balance_infos_from_node_api } from '../helpers/balance';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];
  let account_balance_infos = await get_account_balance_infos_from_node_api(
    address!!
  );
  return new Response(account_balance_infos?.totalBalance.toString());
}
