import { Request } from "itty-router";
import { BigDipperApi } from "../api/bigDipperApi";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { GraphQLClient } from "../helpers/graphql";

export async function handler(request: Request): Promise<Response> {
	let gql_client = new GraphQLClient(GRAPHQL_API);
	let bd_api = new BigDipperApi(gql_client);

	let total_staked_coins = await bd_api.get_total_staked_coins();
	return new Response(ncheq_to_cheq_fixed(Number(total_staked_coins)));
}
