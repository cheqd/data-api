import { BigDipperApi } from '../api/bigDipperApi';
import { NodeApi } from '../api/nodeApi';
import {
  ActiveValidatorsResponse,
  CachedTotalDelegatorsCount,
} from '../types/node';
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

  const delegators = await bd_api.get_active_validators();
  const delegators_count = await getUniqueDelegatorsCountAccrossNetwork(
    delegators
  );
  await cacheDelegatorsCount(delegators_count);
}

export async function getUniqueDelegatorsCountAccrossNetwork(
  activeValidators: ActiveValidatorsResponse
): Promise<number> {
  const store = [];
  const uniques = new Set();
  for (let i = 0; i < activeValidators.validator_info.length; i++) {
    const operator_address =
      activeValidators.validator_info[i].operator_address;

    const resp = await new NodeApi(
      REST_API
    ).staking_get_delegators_per_validator(operator_address);
    console.log('first operator', resp);
    store.push({
      validator: operator_address,
      delegators: resp.delegation_responses,
    });
    console.log(`At ${i}fetched delegators for validator ${operator_address}`);
  }

  console.log('done gettin delegators for each validators');

  for (let i = 0; i < store.length; i++) {
    const delegators = store[i].delegators;
    for (let j = 0; j < delegators.length; j++) {
      uniques.add(
        `${delegators[j].delegation.delegator_address}${delegators[j].delegation.validator_address}`
      );
    }
  }
  return uniques.size;
}
