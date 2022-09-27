import { NodeApi } from "../api/nodeApi";
import { GraphQLClient } from "./graphql";
import { BigDipperApi } from "../api/bigDipperApi";

export async function updateBalance(node_api: NodeApi, address: string): Promise<Response> {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const account = await bd_api.get_account(address);

    try {
        const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_1.${address}`)

        if (typeof cachedAccount === "object") {
            console.log(`account "${address}" found in cache: ${JSON.stringify(cachedAccount)}`)
        }

        console.log(`account "${address}": ${JSON.stringify(account)}`)

        try {
            await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_1.${address}`, JSON.stringify(account))
            console.log(`account "${address}" balance updated. (res=${JSON.stringify(account)})`)

            return new Response(JSON.stringify(account));
        } catch (e) {
            console.error(e)
        }
    } catch (e) {
        console.error(e)
    }
}
