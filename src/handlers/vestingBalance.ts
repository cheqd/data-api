import { IRequest } from 'itty-router';
import { isVestingAccount, isValidAddress } from '../helpers/validate';
import { NodeApi } from '../api/nodeApi';
import { calculateVesting } from '../helpers/vesting';
import { convertToMainTokenDenom } from '../helpers/currency';

export async function handler(request: IRequest, env: Env): Promise<Response> {
	const address = request.params?.['address'];

	if (!address || !isValidAddress(address)) {
		throw new Error('No address specified or wrong address format.');
	}

	const api = new NodeApi(env.REST_API);
	const account = await api.getAccountInfo(address);

	if (!isVestingAccount(account['@type'])) {
		throw new Error(`Only vesting accounts are supported. Accounts type '${account['@type']}'.`);
	}

	const vestingCoins = calculateVesting(account)?.vesting;
	return new Response(convertToMainTokenDenom(vestingCoins!, env.TOKEN_EXPONENT));
}
