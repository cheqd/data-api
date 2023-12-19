import { Request } from 'itty-router';
import { isDelayedVestingAccount, isVestingAccount, isValidAddress } from '../helpers/validate';
import { NodeApi } from '../api/nodeApi';
import { calculateVesting } from '../helpers/vesting';
import { convertToMainTokenDenom } from '../helpers/currency';

export async function handler(request: Request): Promise<Response> {
	const address = request.params?.['address'];

	if (!address || !isValidAddress(address)) {
		throw new Error('No address specified or wrong address format.');
	}

	let api = new NodeApi(REST_API);
	const account = await api.getAccountInfo(address);

	if (!isVestingAccount(account['@type'])) {
		throw new Error(`Only vesting accounts are supported. Accounts type '${account['@type']}'.`);
	}

	if (isDelayedVestingAccount(account?.['@type'])) {
		let balance =
			account?.base_vesting_account?.base_account?.sequence !== '0'
				? Number(
						(await (await api.getAvailableBalance(address)).find((b) => b.denom === 'ncheq')?.amount) ?? '0'
					)
				: 0;
		let rewards = Number((await await api.distributionGetRewards(address)) ?? '0');
		let delegated = Number(
			account?.base_vesting_account?.delegated_free?.find((d) => d.denom === 'ncheq')?.amount ?? '0'
		);

		return new Response(convertToMainTokenDenom(balance + rewards + delegated));
	}

	let vested_coins = Number(calculateVesting(account)?.vested);
	let balance = Number(
		(await (await api.getAvailableBalance(address)).find((b) => b.denom === 'ncheq')?.amount) ?? '0'
	);
	let rewards = Number((await await api.distributionGetRewards(address)) ?? '0');
	let liquid_coins = vested_coins + balance + rewards;

	return new Response(convertToMainTokenDenom(liquid_coins));
}
