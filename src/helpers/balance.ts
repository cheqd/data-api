import { NodeApi } from "../api/nodeApi";
import { GraphQLClient } from "./graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { total_balance_ncheq } from "./node";

export async function updateBalance(node_api: NodeApi, addr: string, grpN: number): Promise<Response> {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const account = await bd_api.get_account(addr);

    if (!account) {
        return new Response(JSON.stringify({ error: "Account not found" }))
    }

    try {
        const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`)

        if (cachedAccount !== undefined) {
            console.log(`account "${addr}" found in cache: ${cachedAccount}`)

            await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, JSON.stringify({
                totalBalance: total_balance_ncheq(account),
            }))

            console.log(`account "${addr}" balance updated. (res=${JSON.stringify(account)})`)

            return new Response(JSON.stringify(account));
        }

        return new Response(JSON.stringify({ error: "Account not found" }));
    } catch (e: any) {
        console.error(e)
        console.log(new Map(e))
        return new Response(JSON.stringify({ error: e }))
    }
}
