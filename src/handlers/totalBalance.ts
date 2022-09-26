import { Request } from "itty-router";
import { validate_cheqd_address } from "../helpers/validate";
import { total_balance_ncheq } from "../helpers/node";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    return new Response(await total_balance_ncheq(address))
}
