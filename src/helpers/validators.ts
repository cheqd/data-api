import { extract_group_number_and_address } from './circulating';
import { get_all_delegators_for_a_validator } from './node';
import { BigDipperApi } from '../api/bigDipperApi';
import { ActiveValidatorsResponse } from '../types/bigDipper';
import { GraphQLClient } from './graphql';
import { NodeApi } from '../api/nodeApi';

export async function updateActiveValidatorsKV() {
  const gql_client = new GraphQLClient(GRAPHQL_API);
  const bd_api = new BigDipperApi(gql_client);
  const active_validators_resp = await bd_api.get_active_validators();

  await remove_any_jailed_validators_from_kv(active_validators_resp);
  await add_new_active_validators_to_kv(active_validators_resp);
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
      put_an_active_validator_in_kv(
        latest_active_validator.operator_address,
        latest_active_validator.validator.validator_voting_powers[0]
          .voting_power
      );
    }
  }
}

async function remove_any_jailed_validators_from_kv(
  active_validators: ActiveValidatorsResponse
) {
  // list of validators form kv
  // list of validators from api
  // loop throu validators from kv, and if
  // a validator from kv doesnt exist in api remove the kv
  console.log('Removing jailed validators, if any');
  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_api_hash_map =
    create_hashmap_of_validators_addresses_from_api(active_validators);

  for (let validator_from_kv of active_validators_from_kv.keys) {
    const key_to_look_up = extract_group_number_and_address(
      validator_from_kv.name
    ).address;
    if (!active_validators_from_api_hash_map.has(key_to_look_up)) {
      delete_stale_validator_from_kv(validator_from_kv.name);
    }
  }
}

function create_hashmap_of_validators_addresses_from_kv(
  validators_from_KV: KVNamespaceListKey<unknown>[]
): Map<string, string> {
  // keys incase contain prefixes, since they are from KV

  const hashmap = new Map();
  for (let key of validators_from_KV) {
    const key_to_look_up = extract_group_number_and_address(key.name).address;
    if (!hashmap.has(key_to_look_up)) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.set(key_to_look_up, key_to_look_up);
    }
  }
  return hashmap;
}

function create_hashmap_of_validators_addresses_from_api(
  validators_from_api: ActiveValidatorsResponse
): Map<string, string> {
  // keys incase contain prefixes, since they are from KV
  const hashmap = new Map<string, string>();
  for (let validator of validators_from_api.validator_info) {
    if (!hashmap.has(validator.operator_address)) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.set(
        validator.operator_address,
        validator.validator.validator_voting_powers[0].voting_power.toString()
      );
    }
  }
  return hashmap;
}

async function put_an_active_validator_in_kv(
  validator_address: string,
  voting_power: number
) {
  // get validator from kv first
  // set it's voting power
  const validator_from_kv = (await ACTIVE_VALIDATORS.get(validator_address, {
    type: 'json',
  })) as ActiveValidatorsKV;

  if (validator_from_kv) {
    const data = {} as ActiveValidatorsKV;
    const node_api = new NodeApi(REST_API);

    const delegator_resp =
      await node_api.staking_get_all_delegations_for_delegator(
        validator_address,
        0,
        true
      );
    data.totalDelegatorsCount = delegator_resp.pagination.total;
    data.updatedAt = new Date().toUTCString();
    data.votingPower = voting_power.toString();

    const validator_group_with_smallest_voting_power =
      await get_validator_group_with_smallest_voting_power();

    const key = `grp_${validator_group_with_smallest_voting_power}:${validator_address}`;
    await ACTIVE_VALIDATORS.put(key, JSON.stringify(data));
    console.log('Added new validator to the list', validator_address);
  }
}
async function delete_stale_validator_from_kv(key: string) {
  await ACTIVE_VALIDATORS.delete(key);
  console.log('Deleted stale validator from the list', key);
}

async function get_validator_group_with_smallest_voting_power(): Promise<number> {
  let voting_power_sum = 0;
  let validator_voting_power_total_arr = [];

  for (let i = 1; i <= Number(ACTIVE_VALIDATOR_GROUPS); i++) {
    const validator_group = i;
    const current_validator_group_data = await ACTIVE_VALIDATORS.list({
      prefix: `grp_${validator_group}:`,
    });

    // accumulates total voting power for specific validator group
    for (let validator of current_validator_group_data.keys) {
      const validator_data = (await ACTIVE_VALIDATORS.get(
        validator.name
      )) as ActiveValidatorsKV;

      if (validator_data && validator_data.votingPower) {
        voting_power_sum += Number(validator_data.votingPower);
      }
    }
    validator_voting_power_total_arr.push(voting_power_sum);
    voting_power_sum = 0; // reset
  }

  let smallest_validator_group = 10; // fallback group is 10
  smallest_validator_group = validator_voting_power_total_arr.sort(
    (a, b) => a - b
  )[0]; // sort by ASC

  return smallest_validator_group;
}
export interface ActiveValidatorsKV {
  totalDelegatorsCount?: string;
  votingPower?: string;
  updatedAt?: string;
}
