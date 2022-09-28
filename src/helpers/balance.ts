import { NodeApi } from "../api/nodeApi";
import { GraphQLClient } from "./graphql";
import { BigDipperApi } from "../api/bigDipperApi";

export async function updateBalance(node_api: NodeApi, addr: string): Promise<Response> {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const account = await bd_api.get_account(addr);

    try {
        const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_1:${addr}`)

        if (cachedAccount) {
            console.log(`account "${addr}" found in cache: ${JSON.stringify(cachedAccount)}`)

            if (typeof account === "object" && account.accountBalance) {
                const grpN = Math.floor(Math.random() * 3) + 1
                await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, JSON.stringify(account))

                console.log(`account "${addr}" balance updated. (res=${JSON.stringify(account)})`)

                return new Response(JSON.stringify(account));
            } else {
                return new Response(JSON.stringify({ error: new Error("something went wrong") }));
            }
        }
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ error: e }))
    }
}
