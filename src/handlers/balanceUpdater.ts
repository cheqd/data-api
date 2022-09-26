import { NodeApi } from "../api/nodeApi";
import { Request } from "itty-router";
import { validate_cheqd_address } from "../helpers/validate";
import { updateBalance } from "../helpers/balance";

export async function handler(request: Request): Promise<Response> {
    let node_api = new NodeApi(REST_API);
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("missing/invalid account address")
    }

    return updateBalance(node_api, address);
}
