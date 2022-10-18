import { NodeApi } from '../api/nodeApi';
import { GraphQLClient } from './graphql';
import { BigDipperApi } from '../api/bigDipperApi';
import { total_balance_ncheq } from './node';
import { Account } from '../types/bigDipper';
import { ncheq_to_cheq_fixed } from './currency';

export async function updateCachedBalance(
  node_api: NodeApi,
  addr: string,
  grpN: number
) {
  let balance = Number(
    (await (
      await node_api.bank_get_account_balances(addr)
    ).find((b) => b.denom === 'ncheq')?.amount) ?? '0'
  );
  let rewards = Number(
    (await await node_api.distribution_get_total_rewards(addr)) ?? '0'
  );

  try {
    const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(
      `grp_${grpN}:${addr}`,
      { type: 'json' }
    );

    // if (cachedAccount !== undefined) {
    console.log(
      `account "${addr}" found in cache: ${JSON.stringify(cachedAccount)}`
    );

    const totalBalance = ncheq_to_cheq_fixed(balance + rewards);
    const data = JSON.stringify({ totalBalance: totalBalance });

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);

    // }
  } catch (e: any) {
    console.error(new Map(e));
    // return null;
  }
}
