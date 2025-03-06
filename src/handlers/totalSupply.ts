import { IRequest } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(request: IRequest, env: Env): Promise<Response> {
	let gql_client = new GraphQLClient(env.GRAPHQL_API);
	let bd_api = new BigDipperApi(gql_client);
	const total_supply = await bd_api.getTotalSupply();
	return new Response(convertToMainTokenDenom(total_supply, env.TOKEN_EXPONENT));
}
