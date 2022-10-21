import { BigDipperApi } from '../api/bigDipperApi';
import { NodeApi } from '../api/nodeApi';
import { Account } from '../types/bigDipper';
import { AccountBalanceInfos } from '../types/node';
import { ncheq_to_cheq_fixed } from './currency';
import { GraphQLClient } from './graphql';
import {
  calculate_total_delegations_balance_for_delegator_in_ncheq,
  calculate_total_unboding_delegations_balance_for_delegator_in_ncheq,
} from './node';

function extract_account_infos(account: Account) {
  let balance = Number(
    account?.accountBalance?.coins.find((c) => c.denom === 'ncheq')?.amount ||
      '0'
  );

  let delegated = 0;
  if (
    account?.delegationBalance?.coins &&
    account?.delegationBalance?.coins.length > 0
  ) {
    delegated = Number(account?.delegationBalance?.coins[0]?.amount || '0');
  }

  let unbonding = 0;
  if (
    account?.unbondingBalance?.coins &&
    account?.unbondingBalance?.coins.length > 0
  ) {
    unbonding = Number(account?.unbondingBalance?.coins[0]?.amount || '0');
  }

  let rewards = 0;
  if (account?.rewardBalance?.length > 0) {
    for (let i = 0; i < account?.rewardBalance.length; i++) {
      rewards += Number(account?.rewardBalance[i]?.coins[0]?.amount || '0');
    }
  }

  return {
    balance,
    rewards,
    delegated,
    unbonding,
  };
}
export async function get_account_balance_infos(
  address: string
): Promise<AccountBalanceInfos | null> {
  try {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const node_api = new NodeApi(REST_API);
    const latest_block_height = (await node_api.get_latest_block_height()) - 10;
    console.log('height', latest_block_height);

    const account_balance_infos: Account | null = await bd_api.get_account(
      address,
      latest_block_height!!
    );
    console.log('account infos', account_balance_infos);
    const { balance, rewards, delegated, unbonding } = extract_account_infos(
      account_balance_infos!!
    );
    return {
      totalBalance: Number(
        ncheq_to_cheq_fixed(balance + rewards + delegated + unbonding)
      ),
      availableBalance: Number(ncheq_to_cheq_fixed(balance)),
      rewards: Number(ncheq_to_cheq_fixed(rewards)),
      delegated: Number(ncheq_to_cheq_fixed(delegated)),
      unbonding: Number(ncheq_to_cheq_fixed(unbonding)),
      timeUpdated: new Date().toUTCString(),
    };
  } catch (e) {
    console.error(`error get_account_balance_infos: ${e}`);
    return null;
  }
}

export async function get_account_balance_infos_from_node_api(
  address: string
): Promise<AccountBalanceInfos | null> {
  const node_api = new NodeApi(REST_API);
  const available_balance = await node_api.bank_get_account_balances(address);
  const available_balance_in_ncheq = Number(available_balance[0].amount);

  const reward_balance_in_ncheq = await node_api.distribution_get_total_rewards(
    address
  );

  const total_delegation_balance_in_ncheq =
    await calculate_total_delegations_balance_for_delegator_in_ncheq(
      await node_api.staking_get_all_delegations_for_delegator(address)
    );

  const total_unbonding_balance_in_ncheq =
    await calculate_total_unboding_delegations_balance_for_delegator_in_ncheq(
      await node_api.staking_get_all_unboding_delegations_for_delegator(address)
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

export async function updateCachedBalance(addr: string, grpN: number) {
  try {
    const account_balance_infos = await get_account_balance_infos_from_node_api(
      addr
    );

    const data = JSON.stringify(account_balance_infos);

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.log(`error updateCachedBalance: ${e}`);
  }
}
