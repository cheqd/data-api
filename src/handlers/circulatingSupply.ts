import { Request } from 'itty-router';
import { getCirculatingSupply } from '../helpers/circulating';

export async function handler(request: Request): Promise<Response> {
  let circulating_supply = await getCirculatingSupply();

  return new Response(circulating_supply.toString());
}
