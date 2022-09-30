import { NodeApi } from "../api/nodeApi";
import { GraphQLClient } from "./graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { total_balance_ncheq } from "./node";
import { Account } from "../types/bigDipper";

export async function updateCachedBalance(node_api: NodeApi, addr: string, grpN: number): Promise<Account | null> {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const account = await bd_api.get_account(addr);

    if (!account) {
        throw new Error(`Account not found for address "${addr}"`)
    }

    try {
        const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`)

        if (cachedAccount !== undefined) {
            console.log(`account "${addr}" found in cache: ${cachedAccount}`)

            const totalBalance = total_balance_ncheq(account);
            const data = JSON.stringify({ totalBalance });

            await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data)

            console.log(`account "${addr}" balance updated. (${data})`)

            return account;
        }

        return null;
    } catch (e: any) {
        console.error(new Map(e))
        throw e;
    }
}
