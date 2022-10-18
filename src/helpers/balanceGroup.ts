import { updateCachedBalance } from './balance';
import { NodeApi } from '../api/nodeApi';
import { Account } from '../types/bigDipper';

export async function updateGroupBalances() {
  console.log('updatingg....');
  let node_api = new NodeApi(REST_API);
  let grouptToBeUpdated = await CURRENT_CSW_GROUP_TO_BE_UPDATED.get('group');

  const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({
    prefix: `grp_${Number(grouptToBeUpdated)}:`,
  });

  console.log(
    `found ${cached.keys.length} cached accounts for group ${grouptToBeUpdated}`
  );

  for (const key of cached.keys) {
    const parts = key.name.split(':');
    let addr = parts[1];
    let grpN = Number(parts[0].split('_')[1]);

    if (key.name.includes('delayed:')) {
      addr = parts[2];
      console.log('some include delayed...');
    }

    const found = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`);
    console.log('address to be updated', found);
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
  // updated CSW_group
  if (Number(grouptToBeUpdated) < 4) {
    await CURRENT_CSW_GROUP_TO_BE_UPDATED.put(
      'group',
      `${Number(grouptToBeUpdated) + 1}`
    );
  } else {
    await CURRENT_CSW_GROUP_TO_BE_UPDATED.put('group', `${1}`);
  }
}
