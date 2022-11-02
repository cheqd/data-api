import { NodeApi } from '../api/nodeApi';
import { AccountBalanceInfos } from '../types/node';
import { ncheq_to_cheq_fixed } from './currency';
import {
  calculate_total_delegations_balance_for_delegator_in_ncheq,
  calculate_total_unbonding_delegations_balance_for_delegator_in_ncheq,
} from './node';

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
