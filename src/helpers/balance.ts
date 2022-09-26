import { NodeApi } from "../api/nodeApi";
import { ncheq_to_cheqd } from "./currency";

export async function updateBalance(node_api: NodeApi, address: string): Promise<Response> {
    const account = await node_api.auth_get_account(address)

    try {
        const cachedAccount = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_1.${address}`)

        if (typeof cachedAccount === "object") {
            console.log(`account "${address}" found in cache: ${JSON.stringify(cachedAccount)}`)
        }

        const balance = Number(await (await node_api.bank_get_account_balances(address)).find(b => b.denom === "ncheq")?.amount ?? '0');
        const rewards = Number(await (await node_api.distribution_get_total_rewards(address)) ?? '0');
        const delegated = Number(account?.base_vesting_account?.delegated_vesting?.find(d => d.denom === "ncheq")?.amount ?? '0');

        let res = {
            balance: ncheq_to_cheqd(balance),
            rewards: ncheq_to_cheqd(rewards),
            delegated: ncheq_to_cheqd(delegated),
            total_balance: ncheq_to_cheqd(balance + rewards + delegated)
        };

        console.log(`account "${address}" total balance: ${res.total_balance}`)

        try {
            await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_1.${address}`, JSON.stringify(res))
            console.log(`account "${address}" balance updated. (res=${JSON.stringify(res)})`)

            return new Response(JSON.stringify(res));
        } catch (e) {
            console.error(e)
        }
    } catch (e) {
        console.error(e)
    }
}
