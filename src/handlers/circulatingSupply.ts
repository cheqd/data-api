import { Request } from 'itty-router';
import { ncheq_to_cheq_fixed } from '../helpers/currency';
import { updateCachedBalance } from '../helpers/balance';
import { NodeApi } from '../api/nodeApi';
import { extract_group_number_and_address } from '../helpers/balanceGroup';
import { AccountBalanceInfos } from '../types/node';

async function get_total_supply(): Promise<number> {
  let node_api = new NodeApi(REST_API);
  let total_supply_ncheq = await node_api.bank_get_total_supply_ncheq();
  const total_supply = Number(ncheq_to_cheq_fixed(total_supply_ncheq));

  return total_supply;
}

async function get_circulating_supply(): Promise<number> {
  let node_api = new NodeApi(REST_API);
  const total_supply = await get_total_supply();

  try {
    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list();
    console.log(`found ${cached.keys.length} cached items`);

    let shareholders_total_balance = Number(0);
    for (const key of cached.keys) {
      console.log(`looking for account: ${key.name} in cache`);
      let data: AccountBalanceInfos | null =
        await CIRCULATING_SUPPLY_WATCHLIST.get(key.name, {
          type: 'json',
        });

      if (data !== null) {
        if (
          data.totalBalance === undefined ||
          data.availiableBalance === undefined ||
          data.rewards === undefined ||
          data.delegated === undefined ||
          data.unbounding === undefined ||
          data.timeUpdated === undefined
        ) {
          const parts = extract_group_number_and_address(key.name);
          updateCachedBalance(node_api, parts.address, parts.groupNumber);
        }

        console.log(
          `found cache entry: ${JSON.stringify(data)} totalBalance=${
            data.totalBalance
          }`
        );

        if (data.totalBalance !== null) {
          shareholders_total_balance += Number(data.totalBalance);
        }
      }
    }

    console.log(
      `Sum of Shareholders total balance: ${shareholders_total_balance}`
    );
    console.log('Total supply', total_supply);
    return total_supply - shareholders_total_balance;
  } catch (e: any) {
    throw new Error(e.toString);
  }
}

export async function handler(request: Request): Promise<Response> {
  let circulating_supply = await get_circulating_supply();

  return new Response(circulating_supply.toString());
}
