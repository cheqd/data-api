import { IRequest } from 'itty-router';
import { getCirculatingSupply } from '../helpers/circulating';

export async function handler(_request: IRequest, env: Env): Promise<Response> {
	try {
		const circulating_supply = await getCirculatingSupply(env);
		return new Response(circulating_supply.toString());
	} catch (error) {
		console.error('Error in circulatingSupply handler:', error);
		return new Response('Error fetching circulating supply', { status: 500 });
	}
}
