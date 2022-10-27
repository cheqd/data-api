import { Request } from 'itty-router';
import { BigDipperApi } from '../api/bigDipperApi';
import { GraphQLClient } from '../helpers/graphql';
import {
  getCachedTotalDelegatorsCount,
  getUniqueDelegatorsCountAccrossNetwork,
} from '../helpers/totalDelegators';

export async function handler(request: Request): Promise<Response> {
  const total_delegators_from_cache = await getCachedTotalDelegatorsCount();
  if (
    total_delegators_from_cache !== null &&
    total_delegators_from_cache.totalDeleagatorsCount !== undefined
  ) {
    return new Response(
      JSON.stringify(total_delegators_from_cache.totalDeleagatorsCount)
    );
  }
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);

  const active_validators = await bd_api.get_active_validators();
  const total_unique_delegators_count =
    await getUniqueDelegatorsCountAccrossNetwork(active_validators);
  return new Response(JSON.stringify(total_unique_delegators_count));
}
