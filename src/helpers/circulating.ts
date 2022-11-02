import { get_account_balance_infos_from_node_api } from './balance';

export function extract_group_number_and_address(key: string) {
  const parts = key.split(':');
  let addr = parts[1];
  let grpN = Number(parts[0].split('_')[1]);
  return {
    address: addr,
    groupNumber: grpN,
  };
}

export async function updateCirculatingSupply(groupNumber: number) {
  const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({
    prefix: `grp_${groupNumber}:`,
  });

  console.log(
    `found ${cached.keys.length} cached accounts for group ${groupNumber}`
  );

  for (const key of cached.keys) {
    const parts = extract_group_number_and_address(key.name);
    let addr = parts.address;
    let grpN = parts.groupNumber;

    const found = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${grpN}:${addr}`);
    if (found) {
      console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`);

      const account = await updateCachedBalance(addr, grpN);

      if (account !== null) {
        console.log(
          `updating account (grp_${grpN}:${addr}) balance (${JSON.stringify(
            account
          )})`
        );
      }
    }
  }
}

export async function updateCachedBalance(addr: string, grpN: number) {
  try {
    const account_balance_infos = await get_account_balance_infos_from_node_api(
      addr
    );

    const data = JSON.stringify(account_balance_infos);

    await CIRCULATING_SUPPLY_WATCHLIST.put(`grp_${grpN}:${addr}`, data);

    console.log(`account "${addr}" balance updated. (${data})`);
  } catch (e: any) {
    console.log(`error updateCachedBalance: ${e}`);
  }
}
