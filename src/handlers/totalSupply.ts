import { IRequest } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { convertToMainTokenDenom } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(_request: IRequest, env: Env): Promise<Response> {
	try {
		const gql_client = new GraphQLClient(env.GRAPHQL_API);
		const bd_api = new BigDipperApi(gql_client);
		const total_supply = await bd_api.getTotalSupply();

		if (total_supply === null || total_supply === undefined || total_supply === 0) {
			return new Response(JSON.stringify({ error: 'Failed to retrieve total supply data' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Return a properly formatted JSON response
		return new Response(
			JSON.stringify({
				totalSupply: convertToMainTokenDenom(total_supply, env.TOKEN_EXPONENT),
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error fetching total supply:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
