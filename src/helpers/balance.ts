import { NodeApi } from '../api/nodeApi';
import { ncheq_to_cheq_fixed } from './currency';
import { validate_cheqd_address } from './validate';

export async function calculate_total_balance_for_an_account(
  node_api: NodeApi,
  address: string
): Promise<Number> {
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
  return Number(ncheq_to_cheq_fixed(balance + rewards + delegated + unbonding));
}
export async function updateCachedBalance(
  node_api: NodeApi,
  addr: string,
  grpN: number
) {
  try {
    const total_balance_without_delegations =
      await calculate_total_balance_for_an_account(node_api, addr);

    const data = JSON.stringify({
      totalBalance: total_balance_without_delegations,
    });

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.error('error', e);
  }
}
