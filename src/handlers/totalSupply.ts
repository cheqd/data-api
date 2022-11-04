import { Request } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { ncheq_to_cheq_fixed } from '../helpers/currency';
import { GraphQLClient } from '../helpers/graphql';

export async function handler(request: Request): Promise<Response> {
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);
  const total_supply = await bd_api.getTotalSupply();
  return new Response(ncheq_to_cheq_fixed(total_supply));
}
