import * as schema from '../schema';
import { DenomTypes, OperationTypes } from '../../types/bigDipper';
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
					type: OperationTypes.CREATE_DID,
					description: 'Create a DID',
				},
				{
					type: OperationTypes.UPDATE_DID,
					description: 'Update a DID',
				},
				{
					type: OperationTypes.DEACTIVATE_DID,
					description: 'Deactivate a DID',
				},
				{
					type: OperationTypes.CREATE_RESOURCE,
					description: 'Create a Resource',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.denomMainnet)
			.values([
				{
					ledgerDenom: 'ncheq',
					friendlyDenom: DenomTypes.NCHEQ,
					exponent: 9,
					description: 'Cheqd Native Token',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.operationTypesTestnet)
			.values([
				{
					type: OperationTypes.CREATE_DID,
					description: 'Create a DID',
				},
				{
					type: OperationTypes.UPDATE_DID,
					description: 'Update a DID',
				},
				{
					type: OperationTypes.DEACTIVATE_DID,
					description: 'Deactivate a DID',
				},
				{
					type: OperationTypes.CREATE_RESOURCE,
					description: 'Create a Resource',
				},
			])
			.onConflictDoNothing();
		await db
			.insert(schema.denomTestnet)
			.values([
				{
					ledgerDenom: 'ncheq',
					friendlyDenom: DenomTypes.NCHEQ,
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
