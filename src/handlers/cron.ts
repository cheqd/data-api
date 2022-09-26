import { NodeApi } from "../api/nodeApi";
import { updateBalance } from "../helpers/balance";

export async function updateAllBalances(event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: String, balances: {}[] } [] = [];

    try {
        const cached = await CIRCULATING_SUPPLY_WATCHLIST.list();

        console.log(`found ${cached.keys.length} cached accounts`)
        for (const account of cached.keys) {
            let addr: string;
            if (account.name.startsWith("grp_1.")) {
                const parts = account.name.split('.')
                addr = parts[1]
            } else {
                addr = account.name
            }
            const res = await updateBalance(node_api, addr)

            balances.push({ account: addr, balances: await res.json() })
        }

        return new Response(JSON.stringify(balances));
    } catch (e) {
        console.error(e)
    }
}
