import { Request } from 'itty-router';
import { get_circulating_supply } from '../helpers/circulating';

export async function handler(request: Request): Promise<Response> {
  let circulating_supply = await get_circulating_supply();

  return new Response(circulating_supply.toString());
}
