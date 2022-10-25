import { BigDipperApi } from '../api/bigDipperApi';
import { CachedTotalDelegatorsCount } from '../types/node';
import { LATEST_TOTAL_DELEGATORS_COUNT } from './constants';
import { GraphQLClient } from './graphql';

export async function cacheDelegatorsCount(totalDeleagatorsCount: Number) {
  const data = {
    totalDelegatorsCount: totalDeleagatorsCount,
    updatedAt: new Date().toUTCString(),
  };
  await TOTAL_DELEGATORS_COUNT_ACROSS_EVERY_VALIDATOR.put(
    LATEST_TOTAL_DELEGATORS_COUNT,
    JSON.stringify(data)
  );
}

export async function getCachedTotalDelegatorsCount(): Promise<CachedTotalDelegatorsCount | null> {
  try {
    let value = await TOTAL_DELEGATORS_COUNT_ACROSS_EVERY_VALIDATOR.get(
      LATEST_TOTAL_DELEGATORS_COUNT
    );

    return JSON.parse(value!!) as CachedTotalDelegatorsCount;
  } catch (e: any) {
    console.error(`getCachedTotalDelegatorsCount: ${e}`);
    return null;
  }
}

export async function updateTotalDelegatorsCount() {
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);

  const delegators = await bd_api.get_total_delegator_count();
  await cacheDelegatorsCount(delegators);
}
