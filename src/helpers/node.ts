import { NodeApi } from '../api/nodeApi';
import { Account } from '../types/bigDipper';
import { Coin, DelegationsResponse, UnbondingResponse } from '../types/node';
import { REST_API_PAGINATION_LIMIT } from './constants';

export function total_balance_ncheq(account: Account): number {
  let balance = Number(
    account?.accountBalance?.coins.find((c) => c.denom === 'ncheq')?.amount ||
      '0'
  );

  let delegations = 0;
  if (
    account?.delegationBalance?.coins &&
    account?.delegationBalance?.coins.length > 0
  ) {
    delegations = Number(account?.delegationBalance?.coins[0].amount);
  }

  let unbonding = 0;
  if (
    account?.unbondingBalance?.coins &&
    account?.unbondingBalance?.coins.length > 0
  ) {
    unbonding = Number(account?.unbondingBalance?.coins[0]?.amount);
  }

  let rewards = 0;
  if (account?.rewardBalance?.length > 0) {
    for (let i = 0; i < account?.rewardBalance.length; i++) {
      rewards += Number(account?.rewardBalance[i]?.coins[0].amount);
    }
  }

  return balance + delegations + unbonding + rewards;
}

export function delayed_balance_ncheq(balance: Coin[]): number {
  return Number(balance.find((c) => c.denom === 'ncheq')?.amount || '0');
}

export async function calculate_total_delegations_balance_for_delegator_in_ncheq(
  delegationsResp: DelegationsResponse,
  current_offset: number
): Promise<number> {
  let total_delegation_balance_in_ncheq = 0;
  const total_count = Number(delegationsResp.pagination.total);

  for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
    total_delegation_balance_in_ncheq += Number(
      delegationsResp.delegation_responses[i].balance.amount
    );
  }

  if (current_offset < total_count) {
    const node_api = new NodeApi(REST_API);
    const delegator_address =
      delegationsResp.delegation_responses[0].delegation.delegator_address;

    const resp = await node_api.staking_get_all_delegations_for_delegator(
      delegator_address,
      current_offset, // our current offset will be updated by recursive call below
      true // we count total again , since it's implemented recursively
    );

    total_delegation_balance_in_ncheq +=
      await calculate_total_delegations_balance_for_delegator_in_ncheq(
        resp,
        current_offset + REST_API_PAGINATION_LIMIT
      );
  }

  return total_delegation_balance_in_ncheq;
}

export async function calculate_total_unboding_delegations_balance_for_delegator_in_ncheq(
  unbondingResp: UnbondingResponse,
  current_offset: number
): Promise<number> {
  let total_unbonding_balance_in_ncheq = 0;
  const total_count = Number(unbondingResp.pagination.total);
  for (let i = 0; i < unbondingResp.unbonding_responses.length; i++) {
    for (
      let j = 0;
      j < unbondingResp.unbonding_responses[i].entries.length;
      j++
    ) {
      total_unbonding_balance_in_ncheq += Number(
        unbondingResp.unbonding_responses[i].entries[j].balance
      );
    }
  }

  if (current_offset < total_count) {
    const node_api = new NodeApi(REST_API);
    const delegator_address =
      unbondingResp.unbonding_responses[0].delegator_address;

    const resp =
      await node_api.staking_get_all_unboding_delegations_for_delegator(
        delegator_address,
        current_offset,
        true
      );

    total_unbonding_balance_in_ncheq +=
      await calculate_total_unboding_delegations_balance_for_delegator_in_ncheq(
        resp,
        current_offset + REST_API_PAGINATION_LIMIT
      );
  }

  return total_unbonding_balance_in_ncheq;
}

export async function get_all_delegators_for_a_validator(
  validator_address: string
): Promise<string[]> {
  const node_api = new NodeApi(REST_API);
  let offset = 0;

  let delegationsResp = await node_api.staking_get_delegators_per_validator(
    validator_address,
    offset,
    true // we set it to true to get total_delegators_count
  );
  const total_delegators_count = Number(delegationsResp.pagination.total);
  const delegators = [];

  while (
    offset < total_delegators_count ||
    delegationsResp.delegation_responses.length > 0
  ) {
    for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
      const delegator =
        delegationsResp.delegation_responses[i].delegation.delegator_address;
      delegators.push(delegator);
    }
    offset += REST_API_PAGINATION_LIMIT;
    delegationsResp = await node_api.staking_get_delegators_per_validator(
      validator_address,
      offset,
      false // we dont need to get total_count on subsequent queries
    );
    if (offset > total_delegators_count) {
      break;
    }
  }

  return delegators;
}
