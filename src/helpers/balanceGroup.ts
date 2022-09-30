import { Account } from "../types/bigDipper";
import { updateCachedBalance } from "./balance";
import { NodeApi } from "../api/nodeApi";

export async function updateGroupBalances(group: number, event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: Account } [] = [];

    const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({ prefix: `grp_${group}:` });
    console.log(`found ${cached.keys.length} cached accounts`)

    for (const key of cached.keys) {
        console.log(`searching ${key.name}`)
        const found = await CIRCULATING_SUPPLY_WATCHLIST.get(key.name)

        if (found) {
            const parts = key.name.split(':')
            let addr = parts[1]
            let grpN = parts[0].split("_")[1]

            if (key.name.includes("delayed:")) {
                addr = parts[2]
            }

            console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`)

            const account = await updateCachedBalance(node_api, addr, grpN)
            console.log(`updated account ${JSON.stringify(account)}`)

            if (account !== null) {
                console.log(`updating account (grp_${grpN}:${addr}) balance (${JSON.stringify(account)})`)
                balances.push({ account: account })
            }
        }
    }
}
