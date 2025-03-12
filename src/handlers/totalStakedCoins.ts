import { IRequest } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(_request: IRequest, env: Env): Promise<Response> {
	const gql_client = new GraphQLClient(env.GRAPHQL_API);
	const bd_api = new BigDipperApi(gql_client);

	const total_staked_coins = await bd_api.getTotalStakedCoins();

	return new Response(convertToMainTokenDenom(Number(total_staked_coins), env.TOKEN_EXPONENT));
}
