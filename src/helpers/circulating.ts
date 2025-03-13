import { fetchAccountBalances } from './balance';
import { convertToMainTokenDenom } from '../helpers/currency';
import { AccountBalanceInfos } from '../types/node';
import { extractPrefixAndKey } from './kv';
import { BigDipperApi } from '../api/bigDipperApi';
import { GraphQLClient } from '../helpers/graphql';

export async function updateCirculatingSupply(groupNumber: number, env: Env) {
	try {
		const cached = await env.CIRCULATING_SUPPLY_WATCHLIST.list({
			prefix: `group_${groupNumber}:`,
		});

		console.log(`found ${cached.keys.length} cached accounts for group ${groupNumber}`);

		for (const key of cached.keys) {
			const parts = extractPrefixAndKey(key.name);
			const addr = parts.address;
			const grpN = parts.groupNumber;

			const found = await env.CIRCULATING_SUPPLY_WATCHLIST.get(`group_${grpN}:${addr}`);
			if (found) {
				console.log(`found ${key.name} (addr=${addr}) grp=${grpN}`);

				const account = await updateCachedBalance(addr, grpN, env);

				if (account !== null) {
					console.log(`updating account (group_${grpN}:${addr}) balance (${JSON.stringify(account)})`);
				}
			}
		}
	} catch (e) {
		console.log('Error at: ', 'updateCirculatingSupply');
	}
}

export async function updateCachedBalance(addr: string, grpN: number, env: Env) {
	try {
		const account_balance_infos = await fetchAccountBalances(addr, env);

		const data = JSON.stringify(account_balance_infos);

		await env.CIRCULATING_SUPPLY_WATCHLIST.put(`group_${grpN}:${addr}`, data);

		console.log(`account "${addr}" balance updated. (${data})`);
	} catch (e: any) {
		console.log(`error updateCachedBalance: ${e}`);
	}
}

export async function getCirculatingSupply(env: Env): Promise<number> {
	const gql_client = new GraphQLClient(env.GRAPHQL_API);
	const bd_api = new BigDipperApi(gql_client);
	const total_supply_ncheq = await bd_api.getTotalSupply();
	const total_supply = Number(convertToMainTokenDenom(total_supply_ncheq, env.TOKEN_EXPONENT));

	try {
		const cached = await env.CIRCULATING_SUPPLY_WATCHLIST.list();
		console.log(`Total cached entries: ${cached.keys.length}`);
		let shareholders_total_balance = Number(0);
		for (const key of cached.keys) {
			const data: AccountBalanceInfos | null = await env.CIRCULATING_SUPPLY_WATCHLIST.get(key.name, {
				type: 'json',
			});

			if (data !== null && data.totalBalance !== null) {
				shareholders_total_balance += Number(data.totalBalance);
			}
		}

		console.log('Total supply', total_supply);
		console.log(`Watchlist total balance: ${shareholders_total_balance}`);

		const circulating_supply = total_supply - shareholders_total_balance;
		return circulating_supply;
	} catch (e: any) {
		throw new Error(e.toString);
	}
}
