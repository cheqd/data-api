import { NodeApi } from '../api/nodeApi';
import { Account } from '../types/bigDipper';
import { Coin, DelegationsResponse, UnbondingResponse } from '../types/node';

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
  delegationsResp: DelegationsResponse
): Promise<number> {
  let total_delegation_balance_in_ncheq = 0;
  const next_key = delegationsResp.pagination.next_key;

  for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
    total_delegation_balance_in_ncheq += Number(
      delegationsResp.delegation_responses[i].balance.amount
    );
  }

  if (next_key !== null) {
    const node_api = new NodeApi(REST_API);
    const delegator_address =
      delegationsResp.delegation_responses[0].delegation.delegator_address;

    const resp = await node_api.staking_get_all_delegations_for_delegator(
      delegator_address,
      next_key
    );

    total_delegation_balance_in_ncheq +=
      await calculate_total_delegations_balance_for_delegator_in_ncheq(resp);
  }

  return total_delegation_balance_in_ncheq;
}

export async function calculate_total_unboding_delegations_balance_for_delegator_in_ncheq(
  unbondingResp: UnbondingResponse
): Promise<number> {
  let total_unbonding_balance_in_ncheq = 0;
  const next_key = unbondingResp.pagination.next_key;

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

  if (next_key !== null) {
    const node_api = new NodeApi(REST_API);
    const delegator_address =
      unbondingResp.unbonding_responses[0].delegator_address;

    const resp =
      await node_api.staking_get_all_unboding_delegations_for_delegator(
        delegator_address,
        next_key
      );

    total_unbonding_balance_in_ncheq +=
      await calculate_total_unboding_delegations_balance_for_delegator_in_ncheq(
        resp
      );
  }

  return total_unbonding_balance_in_ncheq;
}
