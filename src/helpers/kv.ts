export function extractPrefixAndKey(key: string) {
	const parts = key.split(':');
	const addr = parts[1];
	const grpN = Number(parts[0].split('_')[1]);
	return {
		address: addr,
		groupNumber: grpN,
	};
}
