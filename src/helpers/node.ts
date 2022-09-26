import { Coin } from "../types/node";
import { NodeApi } from "../api/nodeApi";
import { is_delayed_vesting_account_type } from "./validate";
import { ncheq_to_cheq_fixed } from "./currency";

export async function total_balance_ncheq(address: string): Promise<number> {
    // let balance = Number(record.account_balance?.coins.find(c => c.denom === "ncheq")?.amount || '0');
    const node_api = new NodeApi(REST_API);
    const auth_account = await node_api.auth_get_account(address);

    const balance = Number(await (await node_api.bank_get_account_balances(address)).find(b => b.denom === "ncheq")?.amount ?? '0');
    const rewards = Number(await (await node_api.distribution_get_total_rewards(address)) ?? '0');

    if (is_delayed_vesting_account_type(auth_account?.["@type"])) {
        console.log('is delayed vesting account')
        const delegated = Number(auth_account?.base_vesting_account?.delegated_vesting?.find(d => d.denom === "ncheq")?.amount ?? '0');

        return Number(ncheq_to_cheq_fixed(balance + rewards + delegated));
    }

    const delegated = Number(auth_account?.base_vesting_account?.delegated_free?.find(d => d.denom === "ncheq")?.amount ?? '0');

    console.log({
        delegated_free: auth_account?.base_vesting_account?.delegated_free,
        delegated_vesting: auth_account?.base_vesting_account?.delegated_vesting,
        original_vesting: auth_account?.base_vesting_account?.original_vesting
    })

    return Number(ncheq_to_cheq_fixed(balance + delegated + rewards));
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
