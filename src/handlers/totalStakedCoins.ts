import { IRequest } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(_request: IRequest, env: Env): Promise<Response> {
	try {
		const gql_client = new GraphQLClient(env.GRAPHQL_API);
		const bd_api = new BigDipperApi(gql_client);

		const total_staked_coins = await bd_api.getTotalStakedCoins();

		if (total_staked_coins === null || total_staked_coins === undefined) {
			return new Response(JSON.stringify({ error: 'Failed to retrieve staked coins data' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(convertToMainTokenDenom(Number(total_staked_coins), env.TOKEN_EXPONENT));
	} catch (error) {
		console.error('Error fetching total staked coins:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
