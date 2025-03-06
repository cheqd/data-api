import { updateCirculatingSupply } from '../helpers/circulating';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';
import { Network } from '../types/network';
import { syncNetworkData } from '../helpers/identity';

export async function webhookTriggers(env: Env) {
	console.log('Triggering webhook...');
	await sendPriceDiscrepancies(env);

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

export async function sendPriceDiscrepancies(env: Env) {
	try {
		console.log('Sending price discrepancies...');

		const arbitrageOpportunities = await filterArbitrageOpportunities(env);
		const hasArbitrageOpportunities = arbitrageOpportunities.length > 0;
		if (hasArbitrageOpportunities) {
			console.log('Arbitrage opportunities...');
			try {
				const init = {
					body: JSON.stringify({
						arbitrage_opportunities: arbitrageOpportunities,
					}),
					method: 'POST',
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				};

				await fetch(WEBHOOK_URL, init);
			} catch (err: any) {
				console.log(err);
			}
		}
	} catch (e) {
		console.log('Error at: ', 'sendPriceDiscrepancies');
	}
}

function getHour(): number {
	// This function only works when CIRCULATING_SUPPLY_GROUPS is set to 24
	let hour = Number(new Date().getHours() + 1); // getHours() returns 0-23
	return hour;
}

function getRandomGroup(group: number): number {
	let min = 1;
	let max = Math.floor(group);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
