import { NodeApi } from '../api/nodeApi';
import { AccountBalanceInfos } from '../types/node';
import { ncheq_to_cheq_fixed } from './currency';
import { DelegationsResponse, UnbondingResponse } from '../types/node';

export async function get_account_balance_infos_from_node_api(
  address: string
): Promise<AccountBalanceInfos | null> {
  const node_api = new NodeApi(REST_API);
  const available_balance = await node_api.bank_get_account_balances(address);

  let available_balance_in_ncheq = 0;
  if (available_balance.length > 0) {
    available_balance_in_ncheq = Number(available_balance[0]?.amount);
  }

  const reward_balance_in_ncheq = await node_api.distribution_get_total_rewards(
    address
  );
  const total_delegation_balance_in_ncheq =
    await calculate_total_delegations_balance_for_delegator_in_ncheq(
      await node_api.staking_get_all_delegations_for_delegator(
        address,
        0, // first call
        true
      ),
      Number(REST_API_PAGINATION_LIMIT) // second call
    );

  const total_unbonding_balance_in_ncheq =
    await calculate_total_unbonding_delegations_balance_for_delegator_in_ncheq(
      await node_api.staking_get_all_unbonding_delegations_for_delegator(
        address,
        0, // first call
        true
      ),
      Number(REST_API_PAGINATION_LIMIT) // second call
    );

  return {
    totalBalance: Number(
      ncheq_to_cheq_fixed(
        available_balance_in_ncheq +
          reward_balance_in_ncheq +
          total_delegation_balance_in_ncheq +
          total_unbonding_balance_in_ncheq
      )
    ),
    availableBalance: Number(ncheq_to_cheq_fixed(available_balance_in_ncheq)),
    rewards: Number(ncheq_to_cheq_fixed(reward_balance_in_ncheq)),
    delegated: Number(ncheq_to_cheq_fixed(total_delegation_balance_in_ncheq)),
    unbonding: Number(ncheq_to_cheq_fixed(total_unbonding_balance_in_ncheq)),
    timeUpdated: new Date().toUTCString(),
  };
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
        current_offset + Number(REST_API_PAGINATION_LIMIT)
      );
  }

  return total_delegation_balance_in_ncheq;
}

export async function calculate_total_unbonding_delegations_balance_for_delegator_in_ncheq(
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
      await node_api.staking_get_all_unbonding_delegations_for_delegator(
        delegator_address,
        current_offset,
        true
      );

    total_unbonding_balance_in_ncheq +=
      await calculate_total_unbonding_delegations_balance_for_delegator_in_ncheq(
        resp,
        current_offset + Number(REST_API_PAGINATION_LIMIT)
      );
  }

  return total_unbonding_balance_in_ncheq;
}
