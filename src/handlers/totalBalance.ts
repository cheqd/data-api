import { Request } from "itty-router";
import { is_delayed_vesting_account_type, validate_cheqd_address } from "../helpers/validate";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { BigDipperApi } from "../api/bigDipperApi";
import { GraphQLClient } from "../helpers/graphql";
import { total_balance_ncheq } from "../helpers/node";
import { NodeApi } from "../api/nodeApi";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    let node_api = new NodeApi(REST_API);
    let auth_account = await node_api.auth_get_account(address);

    if (is_delayed_vesting_account_type(auth_account?.["@type"])) {
        let balance = Number(await (await node_api.bank_get_account_balances(address)).find(b => b.denom === "ncheq")?.amount ?? '0');
        let rewards = Number(await (await node_api.distribution_get_total_rewards(address)) ?? '0');
        let delegated = Number(auth_account?.base_vesting_account?.delegated_vesting?.find(d => d.denom === "ncheq")?.amount ?? '0');

        return new Response(ncheq_to_cheq_fixed(balance + rewards + delegated));
    }

    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    const record = await bd_api.get_account(address);

    if (record.account) {
        let balance = total_balance_ncheq(record);

        return new Response(ncheq_to_cheq_fixed(balance))
    }

    return new Response("no accounts found", { status: 500 })
}
