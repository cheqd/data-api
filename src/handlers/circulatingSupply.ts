import { GraphQLClient } from "../helpers/graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { NodeApi } from '../api/nodeApi';
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { delayed_balance_ncheq, total_balance_ncheq } from "../helpers/node";
import { filter_marked_as_account_types } from '../helpers/validate';
import { Record } from "../types/bigDipper";

async function get_circulating_supply(circulating_supply_watchlist: string[]): Promise<number> {
    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);
    let node_api = new NodeApi(REST_API);

    let filtered_accounts = filter_marked_as_account_types(circulating_supply_watchlist);
    let non_circulating_accounts = await bd_api.get_accounts(filtered_accounts.other);
    let non_circulating_accounts_delayed = await Promise.all(filtered_accounts?.delayed?.map(address => node_api.bank_get_account_balances(address)));

    const { account, account_balance, } = non_circulating_accounts.data;

    let non_circulating_supply_ncheq = 0;
    for (let i = 0; i < account.length; i++) {
        non_circulating_supply_ncheq += total_balance_ncheq({
            account: account[i],
            account_balance: account_balance[i],
            // delegations: delegations ? delegations[i] : null,
            // unbonding: unbonding ? unbonding[i] : null,
            // delegationRewards: delegationRewards ? delegationRewards[i] : null,
        } as Record)
    }
    let non_circulating_supply_delayed_ncheq = non_circulating_accounts_delayed.map(account => delayed_balance_ncheq(account)).reduce((a, b) => a + b, 0);

    console.log(`Non-circulating supply: ${non_circulating_supply_ncheq + non_circulating_supply_delayed_ncheq}`);
    // Get total supply
    let total_supply = await bd_api.get_total_supply();
    let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');
    console.log(`Total supply: ${total_supply_ncheq}`);

    // Calculate circulating supply
    return total_supply_ncheq - non_circulating_supply_ncheq - non_circulating_supply_delayed_ncheq;
}

export async function handler(request: Request): Promise<Response> {
    let addresses_to_exclude: string[] = (await CIRCULATING_SUPPLY_WATCHLIST.list()).keys.map(k => k.name);

    let circulating_supply = await get_circulating_supply(addresses_to_exclude);

    return new Response(ncheq_to_cheq_fixed(circulating_supply));
}
