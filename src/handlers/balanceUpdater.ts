import { NodeApi } from "../api/nodeApi";
import { Request } from "itty-router";
import { validate_cheqd_address } from "../helpers/validate";
import { updateBalance } from "../helpers/balance";
import { updateAllBalances } from "./cron";

export async function handler(request: Request): Promise<Response> {
    let node_api = new NodeApi(REST_API);
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        const grp = request.params?.['grp'];

        console.log(`updating all account balances (group: ${grp})`)
        const res = await updateAllBalances(Number(grp), {} as Event)
        if (res !== undefined) {
            return res
        }
    }

    return updateBalance(node_api, address ?? "");
}


