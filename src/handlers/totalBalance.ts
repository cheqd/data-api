import { Request } from "itty-router";
import { validate_cheqd_address} from "../helpers/validate";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { BigDipperApi } from "../api/bigDipperApi";
import { GraphQLClient } from "../helpers/graphql";
import { total_balance_ncheq } from "../helpers/node";

export async function handler(request: Request): Promise<Response> {
    const address = request.params?.['address'];

    if (!address || !validate_cheqd_address(address)) {
        throw new Error("No address specified or wrong address format.");
    }

    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    let account = await bd_api.get_acocunt(address);
    let balance =  total_balance_ncheq(account);

    return new Response(ncheq_to_cheq_fixed(balance))
}
