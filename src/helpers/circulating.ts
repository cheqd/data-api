import { get_account_balance_infos_from_node_api } from './balance';
import { ncheq_to_cheq_fixed } from '../helpers/currency';
import { NodeApi } from '../api/nodeApi';
import { AccountBalanceInfos } from '../types/node';
import { extract_group_number_and_address } from './kv';

export async function updateCirculatingSupply(groupNumber: number) {
  try {
    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({
      prefix: `group_${groupNumber}:`,
    });

    console.log(
      `found ${cached.keys.length} cached accounts for group ${groupNumber}`
    );

    for (const key of cached.keys) {
      const parts = extract_group_number_and_address(key.name);
      let addr = parts.address;
      let grpN = parts.groupNumber;

      const found = await CIRCULATING_SUPPLY_WATCHLIST.get(
        `group_${grpN}:${addr}`
      );
      if (found) {
        console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`);

        const account = await updateCachedBalance(addr, grpN);

        if (account !== null) {
          console.log(
            `updating account (group_${grpN}:${addr}) balance (${JSON.stringify(
              account
            )})`
          );
        }
      }
    }
  } catch (e) {
    console.log('Error at: ', 'updateCirculatingSupply');
  }
}

export async function updateCachedBalance(addr: string, grpN: number) {
  try {
    const account_balance_infos = await get_account_balance_infos_from_node_api(
      addr
    );

    const data = JSON.stringify(account_balance_infos);

    await CIRCULATING_SUPPLY_WATCHLIST.put(`group_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.log(`error updateCachedBalance: ${e}`);
  }
}

export async function getTotalSupply(): Promise<number> {
  let node_api = new NodeApi(REST_API);
  let total_supply_ncheq = await node_api.bank_getTotalSupply_ncheq();
  const total_supply = Number(ncheq_to_cheq_fixed(total_supply_ncheq));

  return total_supply;
}

export async function get_circulating_supply(): Promise<number> {
  const total_supply = await getTotalSupply();

  try {
    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list();
    console.log(`Total cached entries: ${cached.keys.length}`);
    let shareholders_total_balance = Number(0);
    for (const key of cached.keys) {
      let data: AccountBalanceInfos | null =
        await CIRCULATING_SUPPLY_WATCHLIST.get(key.name, {
          type: 'json',
        });

      if (data !== null && data.totalBalance !== null) {
        shareholders_total_balance += Number(data.totalBalance);
      }
    }

    console.log('Total supply', total_supply);
    console.log(`Watchlist total balance: ${shareholders_total_balance}`);

    return total_supply - shareholders_total_balance;
  } catch (e: any) {
    throw new Error(e.toString);
  }
}
