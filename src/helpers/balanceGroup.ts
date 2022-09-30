import { NodeApi } from "../api/nodeApi";
import { updateCachedBalance } from "./balance";
import { Account } from "../types/bigDipper";

export async function updateGroupBalances(group: number, event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: Account } [] = [];

    try {
        const cached = await CIRCULATING_SUPPLY_WATCHLIST.list();

        console.log(`found ${cached.keys.length} cached accounts`)
        for (const key of cached.keys) {
            const found = await CIRCULATING_SUPPLY_WATCHLIST.get(key.name)

            if (found) {
                const parts = key.name.split(':')
                let addr = parts[1]

                if (addr.startsWith("delayed:")) {
                    const parts = key.name.split(':')
                    addr = parts[1]
                }

                const account = await updateCachedBalance(node_api, addr, group)

                if (account) {
                    console.log(`updating account (grp_${group}:${addr}) balance (${JSON.stringify(account)})`)
                    balances.push({ account: account })
                }
            }
        }

        return new Response(JSON.stringify(balances));
    } catch (e) {
        console.error(e)
        throw e;
    }
}
