import { Request } from 'itty-router';
import { getCirculatingSupply } from '../helpers/circulating';

export async function handler(request: Request): Promise<Response> {
	try {
		let circulating_supply = await getCirculatingSupply();
		return new Response(circulating_supply);
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
}
