import { NODE_RPC_API_URL} from "../helpers/constants";
import { NodeApi } from "../api/nodeApi";
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";

export async function handler(request: Request): Promise<Response> {
    let nodeApi = new NodeApi(NODE_RPC_API_URL);
    let totalSupply = await nodeApi.bank_get_total_supply_ncheq();

    return new Response(ncheq_to_cheq_fixed(totalSupply));
}
