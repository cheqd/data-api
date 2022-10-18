import { GraphQLClient } from '../helpers/graphql';
import { BigDipperApi } from '../api/bigDipperApi';
import { Request } from 'itty-router';
import { ncheq_to_cheqd, ncheq_to_cheq_fixed } from '../helpers/currency';
import { total_balance_ncheq } from '../helpers/node';
import { Account } from '../types/bigDipper';
import { updateCachedBalance } from '../helpers/balance';
import { NodeApi } from '../api/nodeApi';

async function get_circulating_supply(): Promise<number> {
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);
  let node_api = new NodeApi(REST_API);
  // TODO refactor all of this ex: gettin total supply , gettin total staked

  let total_supply_ncheq = await node_api.bank_get_total_supply_ncheq();
  let total_staked_coins_ncheq = await bd_api.get_total_staked_coins();
  const total_staked_coins = Number(
    ncheq_to_cheq_fixed(Number(total_staked_coins_ncheq))
  );
  const total_supply = Number(ncheq_to_cheq_fixed(total_supply_ncheq));

  try {
    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list();
    console.log(`found ${cached.keys.length} cached items`);

    let non_circulating_supply = Number(0);
    for (const r of cached.keys) {
      console.log(`looking for account: ${r.name} in cache`);
      let data: any = await CIRCULATING_SUPPLY_WATCHLIST.get(r.name, {
        type: 'json',
      });

      if (data !== null) {
        if (data.totalBalance === undefined) {
          const balance =
            // TODO change this to commented implemntation.
            // updateCachedBalance(node_api, r.name.split("grp:")[1], );
            total_balance_ncheq(JSON.parse(data) as Account);
          data = JSON.stringify({
            totalBalance: balance,
            updatedAt: Date.now(),
          });
          console.log(
            `updating bad cache entry: ${JSON.stringify(data)} totalBalance=${
              data.totalBalance
            } data=${JSON.stringify(data)}`
          );
          await CIRCULATING_SUPPLY_WATCHLIST.put(r.name, data);
        }

        console.log(
          `found cache entry: ${JSON.stringify(data)} totalBalance=${
            data.totalBalance
          }`
        );

        if (data.totalBalance !== null) {
          non_circulating_supply += Number(data.totalBalance);
          console.log('non circulatin ', non_circulating_supply);
        }
      }
    }

    console.log(`Non-circulating supply: ${non_circulating_supply}`);
    console.log('Total staked coins', total_staked_coins);
    console.log('Total supply', total_supply);
    return total_supply - (total_staked_coins + non_circulating_supply);
  } catch (e: any) {
    console.error(new Map(e));
    return total_supply_ncheq;
  }
}

export async function handler(request: Request): Promise<Response> {
  let circulating_supply = await get_circulating_supply();

  return new Response(ncheq_to_cheq_fixed(circulating_supply));
}
