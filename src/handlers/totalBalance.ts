import { Request } from 'itty-router';
import { get_account_balance_infos } from '../helpers/balance';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];
  let account_balance_infos = await get_account_balance_infos(address!!);

  for (let i = 0; i < 5; i++) {
    if (
      account_balance_infos?.totalBalance !== 0 &&
      account_balance_infos?.totalBalance !== undefined
    ) {
      break;
    }
    account_balance_infos = await get_account_balance_infos(address!!);
    console.log('After trying again...', account_balance_infos?.totalBalance);
  }
  return new Response(account_balance_infos?.totalBalance.toString());
}
