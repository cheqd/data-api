import { Request } from "itty-router";
import { ANEKA_API_URL } from "../helpers/constants";
import { AnekaApi } from "../api/anekaApi";
import { validate_cheqd_address} from "../helpers/validate";
import { ncheq_to_cheq_fixed } from "../helpers/currency";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    let anekaApi = new AnekaApi(ANEKA_API_URL)
    let totalBalance = await anekaApi.fetch_total_account_balance(address)

    return new Response(ncheq_to_cheq_fixed(totalBalance))
}
