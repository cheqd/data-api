export function extract_group_number_and_address(key: string) {
  const parts = key.split(':');
  let addr = parts[1];
  let grpN = Number(parts[0].split('_')[1]);
  return {
    address: addr,
    groupNumber: grpN,
  };
}
