import { BigDipperApi } from '../api/bigDipperApi';
import {
	didMainnet,
	didTestnet,
	resourceMainnet,
	resourceTestnet,
	denomMainnet,
	denomTestnet,
	operationTypesMainnet,
	operationTypesTestnet,
} from '../database/schema';
import { Network } from '../types/network';
import { TransactionDetails } from '../types/bigDipper';
import { eq, and } from 'drizzle-orm';
import { Client } from 'pg';
import { dbInit, dbClose } from '../database/client';
import { GraphQLClient } from './graphql';

interface DbInstance {
	db: any;
	client: Client;
}

// Define table mappings based on network type
const TABLES: Record<
	Network,
	{
		did: any;
		resource: any;
		denom: any;
		operationTypes: any;
	}
> = {
	[Network.MAINNET]: {
		did: didMainnet,
		resource: resourceMainnet,
		denom: denomMainnet,
		operationTypes: operationTypesMainnet,
	},
	[Network.TESTNET]: {
		did: didTestnet,
		resource: resourceTestnet,
		denom: denomTestnet,
		operationTypes: operationTypesTestnet,
	},
};

export class SyncService {
	constructor(
		private readonly bigDipperApi: BigDipperApi,
		private readonly db: DbInstance['db'],
		private readonly network: Network
	) {}

	async syncData() {
		console.log(`Starting data sync for ${Network[this.network]}...`);

		// Always process all DIDs first
		console.log(`Processing all DIDs first...`);
		await this.syncDids();

		// Then process all resources
		console.log(`Now processing all resources...`);
		await this.syncResources();

		console.log(`${Network[this.network]} data sync completed successfully`);
	}

	async syncDids() {
		const network = this.network;
		const didTable = TABLES[network].did;

		console.log(`Syncing DIDs for ${Network[network]}...`);

		// Get the latest processed did block height
		const lastDid = await this.db.select().from(didTable).orderBy({ blockHeight: 'desc' }).limit(1);

		let offset = 0;
		const limit = 100;
		let hasMore = true;
		let totalProcessed = 0;
		let totalSkipped = 0;

		const lastBlockHeight = lastDid.length > 0 ? Number(lastDid[0].blockHeight) : 0;

		const processedOperations = new Set<string>();

		while (hasMore) {
			console.log(`Fetching DIDs batch: offset=${offset}, limit=${limit}, minHeight=${lastBlockHeight}`);
			const transactions = await this.bigDipperApi.getDids(limit, offset, lastBlockHeight);

			if (transactions.length === 0) {
				hasMore = false;
				continue;
			}

			let batchInserted = 0;
			let batchSkipped = 0;

			for (const tx of transactions) {
				// Create a composite key for this operation
				const operationKey = `${tx.transactionHash}|${tx.operationType}|${tx.didId}`;

				if (processedOperations.has(operationKey)) {
					console.log(`Skipping already processed operation in this run: ${operationKey}`);
					batchSkipped++;
					totalSkipped++;
					continue;
				}

				const wasInserted = await this.insertDid(tx);
				if (wasInserted) {
					batchInserted++;
					totalProcessed++;
					processedOperations.add(operationKey);
				} else {
					batchSkipped++;
					totalSkipped++;
				}
			}

			console.log(`Batch summary: ${batchInserted} inserted, ${batchSkipped} skipped`);

			// If we got fewer than the limit, we've reached the end
			if (transactions.length < limit) {
				hasMore = false;
			} else {
				offset += limit;
			}
		}

		console.log(`Total DIDs processed: ${totalProcessed}, skipped: ${totalSkipped}`);
	}

	private async insertDid(tx: TransactionDetails) {
		try {
			console.log(
				`Processing DID: tx=${tx.transactionHash}, did=${tx.didId}, type=${tx.operationType}, height=${tx.blockHeight}`
			);

			const network = this.network;
			const tables = TABLES[network];

			// Get operation type ID
			const opType = await this.db
				.select()
				.from(tables.operationTypes)
				.where(eq(tables.operationTypes.type, tx.operationType))
				.limit(1);

			if (opType.length === 0) {
				console.error(`Operation type not found: ${tx.operationType}`);
				throw new Error(`Operation type not found: ${tx.operationType}`);
			}

			console.log(`Found operation type: ${tx.operationType} -> ID: ${opType[0].id}`);

			// Enhanced duplicate check with all three criteria
			const existingRecord = await this.db
				.select()
				.from(tables.did)
				.where(
					and(
						eq(tables.did.transactionHash, tx.transactionHash),
						eq(tables.did.operationType, opType[0].id),
						eq(tables.did.didId, tx.didId)
					)
				)
				.limit(1);

			if (existingRecord.length > 0) {
				console.log(`DUPLICATE FOUND: tx=${tx.transactionHash}, did=${tx.didId}, type=${tx.operationType}`);
				console.log(
					`Existing record details: ID=${existingRecord[0].id}, height=${existingRecord[0].blockHeight}, created=${existingRecord[0].createdAt}`
				);
				console.log(`New record details: height=${tx.blockHeight}, created=${tx.timestamp}`);
				return false; // Return false to indicate no insertion happened
			}

			console.log(`No duplicate found, proceeding with insertion`);

			// Transform DID ID if needed
			if (tx.didId) {
				const namespace = network === Network.MAINNET ? 'did:cheqd:mainnet:' : 'did:cheqd:testnet:';

				// Check if the didId already has the namespace
				if (!tx.didId.startsWith('did:cheqd:')) {
					const originalDidId = tx.didId;
					tx.didId = namespace + tx.didId;
					console.log(`Transformed DID ID: ${originalDidId} -> ${tx.didId}`);
				}
			}

			// Get denom ID
			const denomRecord = await this.db
				.select()
				.from(tables.denom)
				.where(eq(tables.denom.ledgerDenom, tx.denom || 'ncheq'))
				.limit(1);

			if (denomRecord.length === 0) {
				console.error(`Denom not found: ${tx.denom}`);
				throw new Error(`Denom not found: ${tx.denom}`);
			}

			console.log(`Found denom: ${tx.denom} -> ID: ${denomRecord[0].id}`);

			// Insert DID data
			try {
				const insertResult = await this.db.insert(tables.did).values({
					didId: tx.didId,
					operationType: opType[0].id,
					feePayer: tx.feePayer,
					amount: BigInt(tx.amount),
					denom: denomRecord[0].id,
					blockHeight: BigInt(tx.blockHeight),
					transactionHash: tx.transactionHash,
					createdAt: new Date(tx.timestamp),
					success: tx.success,
				});

				console.log(
					`Successfully inserted DID: tx=${tx.transactionHash}, did=${tx.didId}, type=${tx.operationType}`
				);
				return true;
			} catch (insertError) {
				console.error(
					`Error during DB insert: ${insertError instanceof Error ? insertError.message : String(insertError)}`
				);
				console.error(
					`Insert payload: ${JSON.stringify({
						didId: tx.didId,
						operationType: opType[0].id,
						feePayer: tx.feePayer,
						amount: tx.amount,
						denom: denomRecord[0].id,
						blockHeight: tx.blockHeight,
						transactionHash: tx.transactionHash,
						createdAt: new Date(tx.timestamp),
						success: tx.success,
					})}`
				);
				throw insertError;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`Error inserting DID: ${errorMessage}`);
			console.error(`Transaction details: ${JSON.stringify(tx)}`);
			throw error;
		}
	}

	async syncResources() {
		const network = this.network;
		const resourceTable = TABLES[network].resource;

		console.log(`Syncing Resources for ${Network[network]}...`);

		// Get the latest processed resource block height
		const lastResource = await this.db.select().from(resourceTable).orderBy({ blockHeight: 'desc' }).limit(1);

		const lastBlockHeight = lastResource.length > 0 ? Number(lastResource[0].blockHeight) : 0;
		console.log(`Last processed block height: ${lastBlockHeight}`);

		let offset = 0;
		const limit = 100;
		let hasMore = true;
		let totalProcessed = 0;
		let totalSkipped = 0;

		// Add transaction hash tracking
		const processedOperations = new Set<string>();

		while (hasMore) {
			console.log(`Fetching Resources batch: offset=${offset}, limit=${limit}, minHeight=${lastBlockHeight}`);
			const transactions = await this.bigDipperApi.getResources(limit, offset, lastBlockHeight);

			if (transactions.length === 0) {
				hasMore = false;
				continue;
			}

			let batchInserted = 0;
			let batchSkipped = 0;

			for (const tx of transactions) {
				// Create a composite key for this operation
				const operationKey = `${tx.transactionHash}|${tx.operationType}|${tx.resourceId}`;

				if (processedOperations.has(operationKey)) {
					console.log(`Skipping already processed operation in this run: ${operationKey}`);
					batchSkipped++;
					totalSkipped++;
					continue;
				}

				const wasInserted = await this.insertResource(tx);
				if (wasInserted) {
					batchInserted++;
					totalProcessed++;
					processedOperations.add(operationKey);
				} else {
					batchSkipped++;
					totalSkipped++;
				}
			}

			console.log(`Batch summary: ${batchInserted} inserted, ${batchSkipped} skipped`);

			// If we got fewer than the limit, we've reached the end
			if (transactions.length < limit) {
				hasMore = false;
			} else {
				offset += limit;
			}
		}

		console.log(`Total Resources processed: ${totalProcessed}, skipped: ${totalSkipped}`);
	}

	private async insertResource(tx: TransactionDetails): Promise<boolean> {
		try {
			console.log(
				`Processing Resource: tx=${tx.transactionHash}, resource=${tx.resourceId}, type=${tx.operationType}, height=${tx.blockHeight}`
			);

			const network = this.network;
			const tables = TABLES[network];

			// Get operation type ID
			const opType = await this.db
				.select()
				.from(tables.operationTypes)
				.where(eq(tables.operationTypes.type, tx.operationType))
				.limit(1);

			if (opType.length === 0) {
				console.error(`Operation type not found: ${tx.operationType}`);
				throw new Error(`Operation type not found: ${tx.operationType}`);
			}

			console.log(`Found operation type: ${tx.operationType} -> ID: ${opType[0].id}`);

			// Enhanced duplicate check with all three criteria
			const existingRecord = await this.db
				.select()
				.from(tables.resource)
				.where(
					and(
						eq(tables.resource.transactionHash, tx.transactionHash),
						eq(tables.resource.operationType, opType[0].id),
						eq(tables.resource.resourceId, tx.resourceId)
					)
				)
				.limit(1);

			if (existingRecord.length > 0) {
				console.log(
					`DUPLICATE FOUND: tx=${tx.transactionHash}, resource=${tx.resourceId}, type=${tx.operationType}`
				);
				console.log(
					`Existing record details: ID=${existingRecord[0].id}, height=${existingRecord[0].blockHeight}, created=${existingRecord[0].createdAt}`
				);
				console.log(`New record details: height=${tx.blockHeight}, created=${tx.timestamp}`);
				return false;
			}

			console.log(`No duplicate found, proceeding with insertion`);

			// Transform collection ID to DID
			if (tx.didId) {
				const namespace = network === Network.MAINNET ? 'did:cheqd:mainnet:' : 'did:cheqd:testnet:';

				// Check if the didId already has the namespace
				if (!tx.didId.startsWith('did:cheqd:')) {
					const originalDidId = tx.didId;
					tx.didId = namespace + tx.didId;
					console.log(`Transformed DID ID: ${originalDidId} -> ${tx.didId}`);
				}
			}

			// Get denom ID
			const denomRecord = await this.db
				.select()
				.from(tables.denom)
				.where(eq(tables.denom.ledgerDenom, tx.denom || 'ncheq'))
				.limit(1);

			if (denomRecord.length === 0) {
				console.error(`Denom not found: ${tx.denom}`);
				throw new Error(`Denom not found: ${tx.denom}`);
			}

			console.log(`Found denom: ${tx.denom} -> ID: ${denomRecord[0].id}`);

			// Insert resource data
			try {
				await this.db.insert(tables.resource).values({
					resourceId: tx.resourceId,
					resourceType: tx.resourceType,
					resourceName: tx.resourceName,
					operationType: opType[0].id,
					didId: tx.didId,
					feePayer: tx.feePayer,
					amount: BigInt(tx.amount),
					denom: denomRecord[0].id,
					blockHeight: BigInt(tx.blockHeight),
					transactionHash: tx.transactionHash,
					createdAt: new Date(tx.timestamp),
					success: tx.success,
				});

				console.log(
					`Successfully inserted Resource: tx=${tx.transactionHash}, resource=${tx.resourceId}, type=${tx.operationType}`
				);
				return true;
			} catch (insertError) {
				console.error(
					`Error during DB insert: ${insertError instanceof Error ? insertError.message : String(insertError)}`
				);
				throw insertError;
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`Error inserting Resource: ${errorMessage}`, tx);
			throw error;
		}
	}
}

export async function syncNetworkData(network: Network, env: Env) {
	console.log(`Syncing ${Network[network]} data...`);
	
	const dbInstance = await dbInit(env);
	try {
		// Use the correct GraphQL endpoint based on the network
		const apiUrl = network === Network.MAINNET ? env.GRAPHQL_API : env.TESTNET_GRAPHQL_API;
		const graphqlClient = new GraphQLClient(apiUrl);
		
		const bigDipperApi = new BigDipperApi(graphqlClient);
		const syncService = new SyncService(bigDipperApi, dbInstance.db, network);
		await syncService.syncData();
		console.log(`${Network[network]} data sync completed successfully`);
	} finally {
		await dbClose(dbInstance);
	}
}
