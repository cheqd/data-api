import { IRequest } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(request: IRequest, env: Env): Promise<Response> {
	let gql_client = new GraphQLClient(env.GRAPHQL_API);
	let bd_api = new BigDipperApi(gql_client);

	let total_staked_coins = await bd_api.getTotalStakedCoins();

	return new Response(convertToMainTokenDenom(Number(total_staked_coins), env.TOKEN_EXPONENT));
}
