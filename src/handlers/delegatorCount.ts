import { Request } from "itty-router";
import { BigDipperApi } from "../api/bigDipperApi";
import { GraphQLClient } from "../helpers/graphql";

export async function handler(request: Request): Promise<Response> {
	const address = request.params?.['validator_address'];

	if (!address) {
		throw new Error("No address specified or wrong address format.");
	}

	let gql_client = new GraphQLClient(GRAPHQL_API);
	let bd_api = new BigDipperApi(gql_client);

	let delegators = await bd_api.get_delegator_count_for_validator(address);
	return new Response(delegators.toString());
}
