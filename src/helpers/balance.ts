import { NodeApi } from '../api/nodeApi';
import { AccountBalanceInfos, DelegationsResponse, UnbondingResponse } from '../types/node';
import { convertToMainTokenDenom } from './currency';
import {} from '../types/node';

export async function fetchAccountBalances(address: string, env: Env): Promise<AccountBalanceInfos | null> {
	const node_api = new NodeApi(env.REST_API);
	const available_balance = await node_api.getAvailableBalance(address);

	// Filter the balances to find the one with denom 'ncheq'
	const ncheqBalance = available_balance.find((balance) => balance.denom === 'ncheq');

	let available_balance_in_ncheq = 0;
	if (available_balance.length > 0) {
		available_balance_in_ncheq = ncheqBalance ? Number(ncheqBalance.amount) : 0;
	}

	const reward_balance_in_ncheq = await node_api.distributionGetRewards(address);
	const total_delegation_balance_in_ncheq = await calculateTotalDelegationBalance(
		await node_api.getAllDelegations(
			address,
			0, // first call
			true,
			env
		),
		Number(env.REST_API_PAGINATION_LIMIT), // second call
		env
	);

	const total_unbonding_balance_in_ncheq = await calculateTotalUnbondingBalance(
		await node_api.getAllUnbondingDelegations(
			address,
			0, // first call
			true,
			env
		),
		Number(env.REST_API_PAGINATION_LIMIT), // second call
		env
	);

	return {
		totalBalance: Number(
			convertToMainTokenDenom(
				available_balance_in_ncheq +
					reward_balance_in_ncheq +
					total_delegation_balance_in_ncheq +
					total_unbonding_balance_in_ncheq,
				env.TOKEN_EXPONENT
			)
		),
		availableBalance: Number(convertToMainTokenDenom(available_balance_in_ncheq, env.TOKEN_EXPONENT)),
		rewards: Number(convertToMainTokenDenom(reward_balance_in_ncheq, env.TOKEN_EXPONENT)),
		delegated: Number(convertToMainTokenDenom(total_delegation_balance_in_ncheq, env.TOKEN_EXPONENT)),
		unbonding: Number(convertToMainTokenDenom(total_unbonding_balance_in_ncheq, env.TOKEN_EXPONENT)),
		timeUpdated: new Date().toUTCString(),
	};
}

export async function calculateTotalDelegationBalance(
	delegationsResp: DelegationsResponse,
	current_offset: number,
	env: Env
): Promise<number> {
	let total_delegation_balance_in_ncheq = 0;
	const total_count = Number(delegationsResp.pagination.total);

	for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
		total_delegation_balance_in_ncheq += Number(delegationsResp.delegation_responses[i].balance.amount);
	}

	if (current_offset < total_count) {
		const node_api = new NodeApi(env.REST_API);
		const delegator_address = delegationsResp.delegation_responses[0].delegation.delegator_address;

		const resp = await node_api.getAllDelegations(
			delegator_address,
			current_offset, // our current offset will be updated by recursive call below
			true, // we count total again , since it's implemented recursively
			env
		);

		total_delegation_balance_in_ncheq += await calculateTotalDelegationBalance(
			resp,
			current_offset + Number(env.REST_API_PAGINATION_LIMIT),
			env
		);
	}

	return total_delegation_balance_in_ncheq;
}

export async function calculateTotalUnbondingBalance(
	unbondingResp: UnbondingResponse,
	current_offset: number,
	env: Env
): Promise<number> {
	let total_unbonding_balance_in_ncheq = 0;
	const total_count = Number(unbondingResp.pagination.total);
	for (let i = 0; i < unbondingResp.unbonding_responses.length; i++) {
		for (let j = 0; j < unbondingResp.unbonding_responses[i].entries.length; j++) {
			total_unbonding_balance_in_ncheq += Number(unbondingResp.unbonding_responses[i].entries[j].balance);
		}
	}

	if (current_offset < total_count) {
		const node_api = new NodeApi(env.REST_API);
		const delegator_address = unbondingResp.unbonding_responses[0].delegator_address;

		const resp = await node_api.getAllUnbondingDelegations(delegator_address, current_offset, true, env);

		total_unbonding_balance_in_ncheq += await calculateTotalUnbondingBalance(
			resp,
			current_offset + Number(env.REST_API_PAGINATION_LIMIT),
			env
		);
	}

	return total_unbonding_balance_in_ncheq;
}
