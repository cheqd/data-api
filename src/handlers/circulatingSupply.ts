import { GraphQLClient } from "../helpers/graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";

async function get_circulating_supply(): Promise<number> {
    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    let total_supply = await bd_api.get_total_supply();
    let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');

    try {
        const cached = await CIRCULATING_SUPPLY_WATCHLIST.list()
        console.log(`found ${cached.keys.length} cached items`)

        let non_circulating_supply_ncheq = 0;
        for (const r of cached.keys) {
            console.log(`looking for account: ${JSON.stringify(r.name)} in cache`)
            let cachedFound = await CIRCULATING_SUPPLY_WATCHLIST.get(r.name);

            if (cachedFound !== null) {
                const data: { totalBalance: number | null } = JSON.parse(cachedFound)

                if (data.totalBalance !== null) {
                    console.log(`found cache entry: ${cachedFound}`)
                    non_circulating_supply_ncheq += data.totalBalance;
                }
            }
        }

        console.log(`Non-circulating supply: ${non_circulating_supply_ncheq}`);
        // Get total supply
        let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');
        console.log(`Total supply: ${total_supply_ncheq}`);

        // Calculate circulating supply
        return total_supply_ncheq - non_circulating_supply_ncheq;
    } catch (e: any) {
        console.error(new Map(e))
        return total_supply_ncheq
    }
}

export async function handler(request: Request): Promise<Response> {
    let circulating_supply = await get_circulating_supply();

    return new Response(ncheq_to_cheq_fixed(circulating_supply));
}
