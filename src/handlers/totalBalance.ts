import { IRequest } from 'itty-router';
import { fetchAccountBalances } from '../helpers/balance';

export async function handler(request: IRequest, env: Env): Promise<Response> {
	const address = request.params?.['address'];
	let account_balance_infos = await fetchAccountBalances(address!!, env);
	return new Response(account_balance_infos?.totalBalance.toString());
}
