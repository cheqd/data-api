import { GraphQLClient } from "../helpers/graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { filter_marked_as_account_types } from '../helpers/validate';
import { total_balance_ncheq } from "../helpers/node";

async function get_circulating_supply(circulating_supply_watchlist: string[]): Promise<number> {
    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    let filtered_accounts = filter_marked_as_account_types(circulating_supply_watchlist);
    // let non_circulating_accounts = await bd_api.get_accounts(filtered_accounts.other);

    let total_supply = await bd_api.get_total_supply();
    let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');

    try {
        const cachedBalances = await CIRCULATING_SUPPLY_WATCHLIST.list({
            prefix: "grp_1."
        })

        let non_circulating_supply_ncheq = 0;
        for (const account of cachedBalances.keys) {
            const k = account.name.split('.')

            let cached = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_1.${k[1]}`);
            if (cached) {
                const data = JSON.parse(cached)
                non_circulating_supply_ncheq += total_balance_ncheq(data);
            }

        }

        console.log(`Non-circulating supply: ${non_circulating_supply_ncheq}`);
        // Get total supply
        let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');
        console.log(`Total supply: ${total_supply_ncheq}`);

        // Calculate circulating supply
        return total_supply_ncheq - non_circulating_supply_ncheq;
    } catch (e) {
        console.error(e)
    }

    return total_supply_ncheq
}

export async function handler(request: Request): Promise<Response> {
    let addresses_to_exclude: string[] = (await CIRCULATING_SUPPLY_WATCHLIST.list()).keys.map(k => k.name);

    let circulating_supply = await get_circulating_supply(addresses_to_exclude);

    return new Response(ncheq_to_cheq_fixed(circulating_supply));
}
