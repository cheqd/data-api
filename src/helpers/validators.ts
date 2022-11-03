import { BigDipperApi } from '../api/bigDipperApi';
import { ActiveValidatorsResponse } from '../types/bigDipper';
import { GraphQLClient } from './graphql';
import { NodeApi } from '../api/nodeApi';
import { ActiveValidatorsKV } from '../types/kv';

export async function updateActiveValidatorsKV() {
  try {
    const gql_client = new GraphQLClient(GRAPHQL_API);
    const bd_api = new BigDipperApi(gql_client);
    const active_validators_resp = await bd_api.get_active_validators();

    await remove_any_jailed_validators_from_kv(active_validators_resp);
    await add_new_active_validators_to_kv(active_validators_resp);
  } catch (e) {
    console.log('Error at: ', 'updateActiveValidatorsKV');
  }
}

async function add_new_active_validators_to_kv(
  active_validators: ActiveValidatorsResponse
) {
  console.log('Adding new active validators to KV, if any...');

  const latest_active_validators_from_api = active_validators.validator_info;
  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_kv_hashmap =
    create_hashmap_of_validators_addresses_from_kv(
      active_validators_from_kv.keys as KVNamespaceListKey<unknown>[]
    );

  for (let latest_active_validator of latest_active_validators_from_api) {
    // if latest_active_validator is in kv, keep it.
    // if latest_active_validator is not in kv, add it.
    const is_active_validator_in_kv = active_validators_from_kv_hashmap.has(
      latest_active_validator.operator_address
    );

    if (!is_active_validator_in_kv) {
      // can only update validator's voting power. it's delegator count is updated when TOTAL_DELEGATORS KV is updated.
      put_an_active_validator_in_kv(latest_active_validator.operator_address);
    }
  }
}

async function remove_any_jailed_validators_from_kv(
  active_validators: ActiveValidatorsResponse
) {
  // Loop through validators from kv, and if
  // a validator from KV doesn't exist in API remove from KV
  console.log('Removing jailed validators, if any');
  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_api_hash_map =
    create_hashmap_of_validators_addresses_from_api(active_validators);

  for (let validator_from_kv of active_validators_from_kv.keys) {
    if (!active_validators_from_api_hash_map.has(validator_from_kv.name)) {
      delete_stale_validator_from_kv(validator_from_kv.name);
    }
  }
}

function create_hashmap_of_validators_addresses_from_kv(
  validators_from_KV?: KVNamespaceListKey<unknown>[]
): Map<string, string> {
  const hashmap = new Map();
  // In case keys contain prefixes, since they are from KV
  if (!validators_from_KV) {
    return hashmap;
  }

  for (let key of validators_from_KV) {
    if (!hashmap.has(key.name)) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.set(key.name, key.name);
    }
  }
  return hashmap;
}

function create_hashmap_of_validators_addresses_from_api(
  validators_from_api: ActiveValidatorsResponse
): Map<string, string> {
  // In case keys contain prefixes, since they are from KV
  const hashmap = new Map<string, string>();
  for (let validator of validators_from_api.validator_info) {
    if (!hashmap.has(validator.operator_address)) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.set(validator.operator_address, validator.operator_address);
    }
  }
  return hashmap;
}

async function put_an_active_validator_in_kv(validator_address: string) {
  console.log('putting new active validator', validator_address);
  const data = {} as ActiveValidatorsKV;
  const node_api = new NodeApi(REST_API);
  console.log('data', JSON.stringify(data));
  const delegator_resp = await node_api.staking_get_delegators_per_validator(
    validator_address,
    0,
    true,
    1 // set limit param to 1, lessen stress on node api
  );

  console.log('delegator resp', JSON.stringify(delegator_resp));

  data.totalDelegatorsCount = delegator_resp.pagination.total;
  data.updatedAt = new Date().toUTCString();
  console.log(`Validator data ${JSON.stringify(data)}`);

  const key = validator_address;
  await ACTIVE_VALIDATORS.put(key, JSON.stringify(data));
  console.log('Added new validator to the list', key);
}

async function delete_stale_validator_from_kv(key: string) {
  await ACTIVE_VALIDATORS.delete(key);
  console.log('Deleted stale validator from the list', key);
}

export async function try_getting_delegators_count_from_KV(
  validator_address: string
) {
  const validator_data = (await ACTIVE_VALIDATORS.get(
    validator_address
  )) as ActiveValidatorsKV;

  return validator_data.totalDelegatorsCount
    ? validator_data.totalDelegatorsCount
    : null;
}
