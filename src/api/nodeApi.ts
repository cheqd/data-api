import { Account, Coin, DelegationsResponse, UnbondingResponse, RewardsResponse } from '../types/node';

export class NodeApi {
	constructor(public readonly base_rest_api_url: string) {}

	async getAccountInfo(address: string): Promise<Account> {
		let resp = await fetch(`${this.base_rest_api_url}/cosmos/auth/v1beta1/accounts/${address}`);
		let respJson = (await resp.json()) as { account: Account };

		return respJson.account;
	}

	async getAvailableBalance(address: string): Promise<Coin[]> {
		let resp = await fetch(`${this.base_rest_api_url}/cosmos/bank/v1beta1/balances/${address}`);
		let respJson = (await resp.json()) as { balances: Coin[] };

		return respJson.balances;
	}

	async distributionGetRewards(address: string): Promise<number> {
		let resp = await fetch(`${this.base_rest_api_url}/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
		let respJson = (await resp.json()) as RewardsResponse;

		return Number(respJson?.total?.[0]?.amount ?? '0');
	}

	async getAllDelegations(address: string, offset: number, should_count_total: boolean, env: Env, limit?: number) {
		// order of query params: count_total -> offset -> limit
		const pagination_count_total = should_count_total
			? 'pagination.count_total=true'
			: 'pagination.count_total=false';
		const pagination_limit = `pagination.limit=${limit ? limit : env.REST_API_PAGINATION_LIMIT}`;
		const pagination_offset = `pagination.offset=${offset}`;
		// NOTE: be cautious of newlines or spaces. Might make the request URL malformed
		const resp = await fetch(
			`${this.base_rest_api_url}/cosmos/staking/v1beta1/delegations/${address}?${pagination_count_total}&${pagination_limit}&${pagination_offset}`
		);

		return (await resp.json()) as DelegationsResponse;
	}

	async getAllUnbondingDelegations(address: string, offset: number, should_count_total: boolean, env: Env,) {
		// order of query params: count_total -> offset -> limit
		const pagination_count_total = should_count_total
			? 'pagination.count_total=true'
			: 'pagination.count_total=false';
		const pagination_limit = `pagination.limit=${env.REST_API_PAGINATION_LIMIT}`;
		const pagination_offset = `pagination.offset=${offset}`;
		// NOTE: be cautious of new lines or spaces. Might make the request URL malformed
		const resp = await fetch(
			`${this.base_rest_api_url}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations?${pagination_count_total}&${pagination_limit}&${pagination_offset}`
		);

		return (await resp.json()) as UnbondingResponse;
	}
}
