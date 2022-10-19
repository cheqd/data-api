import { NodeApi } from '../api/nodeApi';
import { AccountBalanceInfos } from '../types/node';
import { ncheq_to_cheq_fixed } from './currency';
import { validate_cheqd_address } from './validate';

export async function get_account_balance_infos(
  node_api: NodeApi,
  address: string
): Promise<AccountBalanceInfos> {
  if (!address || !validate_cheqd_address(address)) {
    throw new Error('No address specified or wrong address format.');
  }
  let auth_account = await node_api.auth_get_account(address);

  let balance = Number(
    (await (
      await node_api.bank_get_account_balances(address)
    ).find((b) => b.denom === 'ncheq')?.amount) ?? '0'
  );
  let rewards = Number(
    (await await node_api.distribution_get_total_rewards(address)) ?? '0'
  );
  let delegated = Number(
    auth_account?.base_vesting_account?.delegated_vesting?.find(
      (d) => d.denom === 'ncheq'
    )?.amount ?? '0'
  );

  let unbonding = Number(
    auth_account?.base_vesting_account?.delegated_free?.find(
      (d) => d.denom === 'ncheq'
    )?.amount ?? '0'
  );
  return {
    totalBalance: Number(
      ncheq_to_cheq_fixed(balance + rewards + delegated + unbonding)
    ),
    availiableBalance: balance,
    rewards: Number(ncheq_to_cheq_fixed(rewards)),
    delegated: Number(ncheq_to_cheq_fixed(delegated)),
    unbounding: Number(ncheq_to_cheq_fixed(unbonding)),
    timeUpdated: new Date().toUTCString(),
  };
}
export async function updateCachedBalance(
  node_api: NodeApi,
  addr: string,
  grpN: number
) {
  try {
    const account_balance_infos = await get_account_balance_infos(
      node_api,
      addr
    );

    const data = JSON.stringify(account_balance_infos);

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.error('error', e);
  }
}
