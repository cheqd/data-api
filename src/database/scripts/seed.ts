import * as schema from '../schema';
import { DenomTypes, OperationTypes, FriendlyOperationType } from '../../types/bigDipper';
import { Client, ClientConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'fs';

export const clientConfig: ClientConfig = {
	connectionString: process.env.DB_URL,
};

clientConfig.ssl = {
	ca: fs.readFileSync('/tmp/do-cert.pem').toString(),
};

let client = new Client(clientConfig);

client.connect();
const db = drizzle(client, { logger: true });

async function seedDatabase() {
	try {
		await db
			.insert(schema.operationTypesMainnet)
			.values([
				{
					ledgerOperationType: OperationTypes.CREATE_DID,
					friendlyOperationType: FriendlyOperationType.CREATE_DID,
					description: 'Create a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.UPDATE_DID,
					friendlyOperationType: FriendlyOperationType.UPDATE_DID,
					description: 'Update a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.DEACTIVATE_DID,
					friendlyOperationType: FriendlyOperationType.DEACTIVATE_DID,
					description: 'Deactivate a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.CREATE_RESOURCE,
					friendlyOperationType: FriendlyOperationType.CREATE_RESOURCE,
					description: 'Create a DID-Linked Resource',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.denomMainnet)
			.values([
				{
					ledgerDenom: DenomTypes.NCHEQ,
					friendlyDenom: 'CHEQ',
					exponent: 9,
					description: 'Cheqd Native Token',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.operationTypesTestnet)
			.values([
				{
					ledgerOperationType: OperationTypes.CREATE_DID,
					friendlyOperationType: FriendlyOperationType.CREATE_DID,
					description: 'Create a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.UPDATE_DID,
					friendlyOperationType: FriendlyOperationType.UPDATE_DID,
					description: 'Update a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.DEACTIVATE_DID,
					friendlyOperationType: FriendlyOperationType.DEACTIVATE_DID,
					description: 'Deactivate a DID Document',
				},
				{
					ledgerOperationType: OperationTypes.CREATE_RESOURCE,
					friendlyOperationType: FriendlyOperationType.CREATE_RESOURCE,
					description: 'Create a DID-Linked Resource',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.denomTestnet)
			.values([
				{
					ledgerDenom: DenomTypes.NCHEQ,
					friendlyDenom: 'CHEQ',
					exponent: 9,
					description: 'Cheqd Native Token',
				},
			])
			.onConflictDoNothing();
	} catch (error) {
		console.error('Error seeding database:', error);
	} finally {
		await client.end();
	}
}

seedDatabase();
