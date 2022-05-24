import { GraphQLClient } from "../helpers/graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { GRAPHQL_API, TOKEN_DECIMALS } from "../helpers/constants";
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { total_balance_ncheq } from "../helpers/node";

async function get_circulating_supply(non_circulating_addresses: string[]): Promise<number> {
    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    let non_circulating_accounts = await bd_api.get_accounts(non_circulating_addresses);

    // Calculate total balance of watchlist accounts
    let non_circulating_supply_ncheq = non_circulating_accounts.map(total_balance_ncheq).reduce((a, b) => a + b, 0);
    console.log(`Non-circulating supply: ${non_circulating_supply_ncheq}`);

    // Get total supply
    let total_supply = await bd_api.get_total_supply();
    let total_supply_ncheq = parseInt(total_supply.find(c => c.denom === "ncheq")?.amount || '0');
    console.log(`Total supply: ${total_supply_ncheq}`);

    // Calculate circulating supply
    return total_supply_ncheq - non_circulating_supply_ncheq;
}

export async function handler(request: Request): Promise<Response> {
    // TODO: Read from KV pairs
    let addresses_to_exclude: string[] = ['cheqd1jpudw0avtdd6lay7v3mvsj0nj7ln0v8zw64434'];

    let circulating_supply = await get_circulating_supply(addresses_to_exclude);

    return new Response(ncheq_to_cheq_fixed(circulating_supply));
}
