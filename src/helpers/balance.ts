import { NodeApi } from '../api/nodeApi';
import { ncheq_to_cheq_fixed } from './currency';

async function calculate_total_balance_without_delegations(
  node_api: NodeApi,
  addr: string
): Promise<Number> {
  let balance = Number(
    (await (
      await node_api.bank_get_account_balances(addr)
    ).find((b) => b.denom === 'ncheq')?.amount) ?? '0'
  );
  let rewards = Number(
    (await await node_api.distribution_get_total_rewards(addr)) ?? '0'
  );
  return Number(ncheq_to_cheq_fixed(balance + rewards));
}
export async function updateCachedBalance(
  node_api: NodeApi,
  addr: string,
  grpN: number
) {
  try {
    const total_balance_without_delegations =
      await calculate_total_balance_without_delegations(node_api, addr);

    const data = JSON.stringify({
      totalBalance: total_balance_without_delegations,
    });

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.error('error', e);
  }
}
