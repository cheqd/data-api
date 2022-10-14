import { Request } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(request: Request): Promise<Response> {
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);

  const delegators = await bd_api.get_total_delegator_count();
  return new Response(JSON.stringify(delegators));
}
