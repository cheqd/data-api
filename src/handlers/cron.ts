import { NodeApi } from "../api/nodeApi";
import { updateBalance } from "../helpers/balance";
import { Account } from "../types/bigDipper";

export async function updateAllBalances(group: number, event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: String, balances: Account } [] = [];

    try {
        const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({ prefix: `grp_${group}:` });

        console.log(`found ${cached.keys.length} cached accounts`)
        for (const key of cached.keys) {
            const found = await CIRCULATING_SUPPLY_WATCHLIST.get(key.name)

            if (found) {
                let addr: string;
                if (key.name.startsWith("grp_")) {
                    const parts = key.name.split(':')
                    addr = parts[1]

                    switch (parts[0]) {
                        case 'grp_1':
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_2:${addr}`);
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_3:${addr}`);
                            break

                        case 'grp_2':
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_1:${addr}`);
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_3:${addr}`);
                            break

                        case 'grp_3':
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_1:${addr}`);
                            await CIRCULATING_SUPPLY_WATCHLIST.delete(`grp_2:${addr}`);
                            break
                    }
                } else {
                    addr = key.name
                }

                const res = await updateBalance(node_api, addr, group)

                if (res !== undefined) {
                    const data = await res.json() as Account;
                    console.log(`updating account (grp_${group}:${addr}) balance (${data})`)

                    balances.push({ account: addr, balances: data })
                }
            }
        }

        return new Response(JSON.stringify(balances));
    } catch (e) {
        console.error(e)
    }
}
