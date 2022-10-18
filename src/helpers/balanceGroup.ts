import { updateCachedBalance } from './balance';
import { NodeApi } from '../api/nodeApi';

export function extract_group_number_and_address(key: string) {
  const parts = key.split(':');
  let addr = parts[1];
  let grpN = Number(parts[0].split('_')[1]);

  if (key.includes('delayed:')) {
    addr = parts[2];
  }
  return {
    address: addr,
    groupNumber: grpN,
  };
}

export async function updateGroupBalances() {
  let node_api = new NodeApi(REST_API);
  let balance_group_to_be_updated = await CURRENT_CSW_GROUP_TO_BE_UPDATED.get(
    'group'
  );
  const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({
    prefix: `grp_${balance_group_to_be_updated}:`,
  });

  console.log(
    `found ${cached.keys.length} cached accounts for group ${balance_group_to_be_updated}`
  );

  for (const key of cached.keys) {
    const parts = extract_group_number_and_address(key.name);
    let addr = parts.address;
    let grpN = parts.groupNumber;

    const found = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`);
    if (found) {
      console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`);

      const account = await updateCachedBalance(node_api, addr, grpN);

      if (account !== null) {
        console.log(
          `updating account (grp_${grpN}:${addr}) balance (${JSON.stringify(
            account
          )})`
        );
      }
    }
  }
  //   TODO: move group totatl to env var
  // updated CSW_group (note: we have 4 groups as of now)
  if (Number(balance_group_to_be_updated) < 4) {
    await CURRENT_CSW_GROUP_TO_BE_UPDATED.put(
      'group',
      `${Number(balance_group_to_be_updated) + 1}`
    );
  } else {
    await CURRENT_CSW_GROUP_TO_BE_UPDATED.put('group', `${1}`);
  }
}
