import { NodeApi } from '../api/nodeApi';
import { Account } from '../types/bigDipper';
import { Coin, DelegationsResponse } from '../types/node';

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

export async function calculate_total_delegations_balance_for_delegator(
  delegationsResp: DelegationsResponse
): Promise<number> {
  let total_delegation_balance = 0;
  const next_Key = delegationsResp.pagination.next_key;

  for (let i = 0; i < delegationsResp.delegation_responses.length; i++) {
    total_delegation_balance += Number(
      delegationsResp.delegation_responses[i].balance.amount
    );
  }

  if (next_Key !== null) {
    const node_api = new NodeApi(REST_API);
    const delegator_address =
      delegationsResp.delegation_responses[0].delegation.delegator_address;

    const resp = await node_api.staking_get_all_delegations_for_delegator(
      delegator_address,
      next_Key
    );

    total_delegation_balance +=
      await calculate_total_delegations_balance_for_delegator(resp);
  }
  return total_delegation_balance;
}
