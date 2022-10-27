import { ActiveValidatorsResponse } from '../types/node';
import { extract_group_number_and_address } from './balanceGroup';

export async function add_new_active_validators_to_kv(
  data: ActiveValidatorsResponse
) {
  const latest_active_validators_from_api = data.validator_info;
  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_kv_hashmap =
    create_hashmap_of_validators_addresses_from_kv(
      active_validators_from_kv.keys as []
    );

  for (let latest_active_validator of latest_active_validators_from_api) {
    // if latest_active_validator is in kv, keep it.
    // if latest_active_validator is not in kv, add it.
    const is_active_validator_in_kv =
      active_validators_from_kv_hashmap.key ===
      latest_active_validator.operator_address
        ? true
        : false;

    if (!is_active_validator_in_kv) {
      add_new_active_validator_in_kv(latest_active_validator.operator_address);
    }
  }
}

export async function remove_any_jailed_validators_from_kv(
  active_validators: ActiveValidatorsResponse
) {
  // list of validators form kv
  // list of validators from api
  // loop throu validators from kv, and if
  // a validator from kv doesnt exist in api remove the kv
  const active_validators_from_kv = await ACTIVE_VALIDATORS.list();
  const active_validators_from_api_hash_map =
    create_hashmap_of_validators_addresses_from_api(
      active_validators.validator_info
    );

  for (let validator_from_kv of active_validators_from_kv.keys) {
    const key_to_look_up = extract_group_number_and_address(
      validator_from_kv.name
    ).address;
    if (active_validators_from_api_hash_map.key !== key_to_look_up) {
      delete_stale_validator_from_kv(validator_from_kv.name);
    }
  }
}

export function create_hashmap_of_validators_addresses_from_kv(
  validators_from_KV: string[]
): { key: string } {
  // keys incase contain prexifes, since they are from KV

  const hashmap: { key: string } = { key: '' };
  for (let key of validators_from_KV) {
    const key_to_look_up = extract_group_number_and_address(key).address;
    if (hashmap.key !== key_to_look_up) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.key = key_to_look_up;
    }
  }
  return hashmap;
}

export function create_hashmap_of_validators_addresses_from_api(
  validators_from_api: {
    operator_address: string;
  }[]
): { key: string } {
  // keys incase contain prexifes, since they are from KV
  const hashmap: { key: string } = { key: '' };
  for (let validator_address of validators_from_api) {
    if (hashmap.key !== validator_address.operator_address) {
      // since kv contains prefix like grp_1.. we need to extract address only
      hashmap.key = validator_address.operator_address;
    }
  }
  return hashmap;
}

async function add_new_active_validator_in_kv(address: string) {
  const data = JSON.stringify({ updatedAt: new Date().toUTCString() });
  // for now manually put em in group 10
  const key = `grp_10:${address}`;
  await ACTIVE_VALIDATORS.put(key, data);
}
async function delete_stale_validator_from_kv(key: string) {
  await ACTIVE_VALIDATORS.delete(key);
}
