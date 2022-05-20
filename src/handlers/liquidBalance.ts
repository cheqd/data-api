import { Request } from "itty-router";
import { is_vesting_account_type, validate_cheqd_address } from "../helpers/validate";
import { NodeApi } from "../api/nodeApi";
import { NODE_RPC_API_URL } from "../helpers/constants";
import { calculate_liquid_coins } from "../helpers/vesting";
import { ncheq_to_cheq_fixed } from "../helpers/currency";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    let api = new NodeApi(NODE_RPC_API_URL);
    const account = await api.auth_get_account(address)

    if (!is_vesting_account_type(account["@type"])) {
        throw new Error(`Only vesting accounts are supported. Accounts type '${account["@type"]}'.`)
    }

    let liquid_coins = calculate_liquid_coins(account);

    return new Response(ncheq_to_cheq_fixed(liquid_coins));
}
