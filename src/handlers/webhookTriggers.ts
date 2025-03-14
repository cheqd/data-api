import { updateCirculatingSupply } from '../helpers/circulating';
import { Network } from '../types/network';
import { syncNetworkData } from '../helpers/identity';

export async function webhookTriggers(env: Env) {
	console.log('Triggering webhook...');

	await updateCirculatingSupply(getHour(), env);
	await syncIdentityData(env);
}

export async function syncIdentityData(env: Env) {
	try {
		// Sync mainnet data
		await syncNetworkData(Network.MAINNET, env);
		// Sync testnet data
		await syncNetworkData(Network.TESTNET, env);
	} catch (error) {
		console.error('Error syncing identity data:', (error as Error).message);
	}
}

function getHour(): number {
	// This function only works when CIRCULATING_SUPPLY_GROUPS is set to 24
	const hour = Number(new Date().getHours() + 1); // getHours() returns 0-23
	return hour;
}
