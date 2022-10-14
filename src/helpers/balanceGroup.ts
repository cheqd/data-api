import { updateCachedBalance } from "./balance";
import { NodeApi } from "../api/nodeApi";
import { Account } from "../types/bigDipper";

export async function updateGroupBalances(group: number, event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: Account } [] = [];

    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({ prefix: `grp_${group}:` });

    console.log(`found ${cached.keys.length} cached accounts`)

    for (const key of cached.keys) {
        const parts = key.name.split(':')
        let addr = parts[1]
        let grpN = Number(parts[0].split("_")[1])

        if (key.name.includes("delayed:")) {
            addr = parts[2]
        }

        const found = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`)
        if (found) {
            console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`)

            const account = await updateCachedBalance(node_api, addr, grpN)

            if (account !== null) {
                console.log(`updating account (grp_${grpN}:${addr}) balance (${JSON.stringify(account)})`)
                balances.push({ account: account })
            }
        }
    }

    return balances
}
