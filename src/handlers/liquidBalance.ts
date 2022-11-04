import { Request } from "itty-router";
import { is_delayed_vesting_account_type, is_vesting_account_type, validate_cheqd_address } from "../helpers/validate";
import { NodeApi } from "../api/nodeApi";
import { calculate_vested_coins } from "../helpers/vesting";
import { ncheq_to_cheq_fixed } from "../helpers/currency";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    let api = new NodeApi(REST_API);
    const account = await api.getAccountInfo(address)

    if (!is_vesting_account_type(account["@type"])) {
        throw new Error(`Only vesting accounts are supported. Accounts type '${account["@type"]}'.`)
    }

    if(is_delayed_vesting_account_type(account?.["@type"])) {
        let balance = account?.base_vesting_account?.base_account?.sequence !== '0' ? Number(await (await api.getAvailableBalance(address)).find(b => b.denom === "ncheq")?.amount ?? '0') : 0;
        let rewards = Number(await (await api.distributionGetRewards(address)) ?? '0');
        let delegated = Number(account?.base_vesting_account?.delegated_free?.find(d => d.denom === "ncheq")?.amount ?? '0');

        return new Response(ncheq_to_cheq_fixed(balance + rewards + delegated));
    }

    let vested_coins = calculate_vested_coins(account);
    let balance = Number(await (await api.getAvailableBalance(address)).find(b => b.denom === "ncheq")?.amount ?? '0')
    let rewards = Number(await (await api.distributionGetRewards(address)) ?? '0');
    let liquid_coins = vested_coins + balance + rewards;

    return new Response(ncheq_to_cheq_fixed(liquid_coins));
}
