import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(env: Env): Promise<Response> {
	const gql_client = new GraphQLClient(env.GRAPHQL_API);
	const bd_api = new BigDipperApi(gql_client);
	const total_supply = await bd_api.getTotalSupply();
	return new Response(convertToMainTokenDenom(total_supply, env.TOKEN_EXPONENT));
}
