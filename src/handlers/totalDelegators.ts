import { Request } from 'itty-router';

export async function handler(request: Request): Promise<Response> {
  const total_delegators_from_KV = await (
    await TOTAL_DELEGATORS.list()
  ).keys.length;
  return new Response(JSON.stringify(total_delegators_from_KV));
}
