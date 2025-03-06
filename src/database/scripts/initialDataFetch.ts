import { BigDipperApi } from '../../api/bigDipperApi';
import { GraphQLClient } from '../../helpers/graphql';
import { Network } from '../../types/network';
import { SyncService } from '../../helpers/identity';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, ClientConfig } from 'pg';
import fs from 'fs';

export const clientConfig: ClientConfig = {
	connectionString: process.env.DB_URL,
};

clientConfig.ssl = {
	ca: fs.readFileSync('/tmp/do-cert.pem').toString(),
};

let client = new Client(clientConfig);

client.connect();
const db = drizzle(client, { logger: false });

// Get API URLs from environment variables
const GRAPHQL_API = 'https://explorer-gql.cheqd.io/v1/graphql';
const TESTNET_GRAPHQL_API = 'https://testnet-gql.cheqd.io/v1/graphql';

async function main() {
	console.log('Starting historic data fetch...');

	try {
		// Process all DIDs first for both networks
		console.log('Fetching all DIDs first...');

		// Fetch mainnet DIDs
		console.log('Fetching mainnet DIDs...');
		await fetchNetworkDIDs(Network.MAINNET);

		// Fetch testnet DIDs
		console.log('Fetching testnet DIDs...');
		await fetchNetworkDIDs(Network.TESTNET);

		// Then process all resources
		console.log('Now fetching all resources...');

		// Fetch mainnet resources
		console.log('Fetching mainnet resources...');
		await fetchNetworkResources(Network.MAINNET);

		// Fetch testnet resources
		console.log('Fetching testnet resources...');
		await fetchNetworkResources(Network.TESTNET);

		console.log('Historic data fetch completed successfully');
	} catch (error) {
		console.error('Error fetching historic data:', (error as Error).message);
		process.exit(1);
	} finally {
		// Close the database connection when done
		await client.end();
	}
}

async function fetchNetworkDIDs(network: Network) {
	try {
		// Use the correct GraphQL API URL based on the network
		const apiUrl = network === Network.MAINNET ? GRAPHQL_API : TESTNET_GRAPHQL_API;
		console.log(`Using API URL: ${apiUrl}`);

		const graphqlClient = new GraphQLClient(apiUrl);
		const bigDipperApi = new BigDipperApi(graphqlClient);

		// Create a sync service and call syncDids directly
		const syncService = new SyncService(bigDipperApi, db, network);
		await syncService.syncDids();

		console.log(`${Network[network]} DIDs fetch completed successfully`);
	} catch (error) {
		console.error(`Error fetching ${Network[network]} DIDs:`, (error as Error).message);
		throw error;
	}
}

async function fetchNetworkResources(network: Network) {
	console.log(`Fetching ${Network[network]} resources...`);

	try {
		// Use the correct GraphQL API URL based on the network
		const apiUrl = network === Network.MAINNET ? GRAPHQL_API : TESTNET_GRAPHQL_API;
		console.log(`Using API URL: ${apiUrl}`);

		const graphqlClient = new GraphQLClient(apiUrl);
		const bigDipperApi = new BigDipperApi(graphqlClient);

		// Create a sync service and call syncResources directly
		const syncService = new SyncService(bigDipperApi, db, network);
		await syncService.syncResources();

		console.log(`${Network[network]} resources fetch completed successfully`);
	} catch (error) {
		console.error(`Error fetching ${Network[network]} resources:`, (error as Error).message);
		throw error;
	}
}

// Run the main function
main().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
