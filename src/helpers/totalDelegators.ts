import { extract_group_number_and_address } from './balanceGroup';
import { BigDipperApi } from '../api/bigDipperApi';
import { GraphQLClient } from './graphql';
import { get_all_delegators_for_a_validator } from './node';

export async function add_new_active_validators_to_kv() {
  console.log('Adding new active validators to KV, if any...');
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);
  const data = await bd_api.get_active_validators();

  const latest_active_validators_from_api = data.validator_info;
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
      add_new_active_validator_in_kv(latest_active_validator.operator_address);
    }
  }
}

export async function remove_any_jailed_validators_from_kv() {
  // list of validators form kv
  // list of validators from api
  // loop throu validators from kv, and if
  // a validator from kv doesnt exist in api remove the kv
  console.log('Removing jailed validators, if any');
  let gql_client = new GraphQLClient(GRAPHQL_API);
  let bd_api = new BigDipperApi(gql_client);
  const active_validators = await bd_api.get_active_validators();

  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_api_hash_map =
    create_hashmap_of_validators_addresses_from_api(
      active_validators.validator_info
    );

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
  validators_from_api: {
    operator_address: string;
  }[]
): Map<string, string> {
  // keys incase contain prefixes, since they are from KV
  const hashmap = new Map<string, string>();
  for (let validator_address of validators_from_api) {
    if (!hashmap.has(validator_address.operator_address)) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.set(
        validator_address.operator_address,
        validator_address.operator_address
      );
    }
  }
  return hashmap;
}

async function add_new_active_validator_in_kv(address: string) {
  const data = JSON.stringify({ updatedAt: new Date().toUTCString() });
  // for now manually put em in group 10
  const key = `grp_10:${address}`;
  await ACTIVE_VALIDATORS.put(key, data);
  console.log('Added new validator to the list', address);
}
async function delete_stale_validator_from_kv(key: string) {
  await ACTIVE_VALIDATORS.delete(key);
  console.log('Deleted stale validator from the list', key);
}

export async function update_delegator_to_validators_KV(
  validators_group: number
) {
  console.log('Updating total delegator KV...');
  const validators = await ACTIVE_VALIDATORS.list({
    prefix: `grp_${validators_group}:`,
  });
  console.log('updating group ', validators_group);
  for (let validator of validators.keys) {
    const validator_address = extract_group_number_and_address(
      validator.name
    ).address;

    const delegators_list = await get_all_delegators_for_a_validator(
      validator_address
    );
    for (let delegator of delegators_list) {
      const get_validator_for_delegator_from_kv = (await TOTAL_DELEGATORS.get(
        delegator,
        { type: 'json' }
      )) as string[];

      if (get_validator_for_delegator_from_kv) {
        // delegator has undelegated from all validators
        if (get_validator_for_delegator_from_kv.length === 0) {
          await TOTAL_DELEGATORS.delete(delegator);
          console.log('Deleted delegator ', delegator);
          continue;
        }
        // delegator is still delegating, and delegated to new validator
        const updated_array = [
          ...get_validator_for_delegator_from_kv,
          validator.name,
        ];

        await TOTAL_DELEGATORS.put(delegator, JSON.stringify(updated_array));
        console.log('Updated delegator: ', delegator);
      } else {
        // delegator is delegating to its first validator
        const data = [];
        data.push(validator.name);
        await TOTAL_DELEGATORS.put(delegator, JSON.stringify(data));
        console.log('Added new delegator', delegator);
      }
    }
  }
}
