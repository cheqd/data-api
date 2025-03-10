import {
	pgTable,
	timestamp,
	bigint,
	varchar,
	serial,
	boolean,
	integer,
	pgEnum,
	uuid,
	index,
} from 'drizzle-orm/pg-core';
import { OperationTypes, DenomTypes } from '../types/bigDipper';

// Enums
export const operationTypeEnumMainnet = pgEnum('operation_type_enum_mainnet', [
	OperationTypes.CREATE_DID,
	OperationTypes.UPDATE_DID,
	OperationTypes.DEACTIVATE_DID,
	OperationTypes.CREATE_RESOURCE,
]);

export const operationTypeEnumTestnet = pgEnum('operation_type_enum_testnet', [
	OperationTypes.CREATE_DID,
	OperationTypes.UPDATE_DID,
	OperationTypes.DEACTIVATE_DID,
	OperationTypes.CREATE_RESOURCE,
]);

export const denomsEnumMainnet = pgEnum('denoms_enum_mainnet', [DenomTypes.NCHEQ]);

export const denomsEnumTestnet = pgEnum('denoms_enum_testnet', [DenomTypes.NCHEQ]);

// Mainnet tables

export const didMainnet = pgTable(
	'did_mainnet',
	{
		id: serial('id').primaryKey().notNull(),
		didId: varchar('did_id', { length: 54 }).notNull(),
		operationType: bigint('operationType', { mode: 'bigint' })
			.notNull()
			.references(() => operationTypesMainnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		feePayer: varchar('fee_payer', { length: 44 }).notNull(),
		amount: bigint('amount', { mode: 'bigint' }).notNull(),
		denom: bigint('denom', { mode: 'bigint' })
			.notNull()
			.references(() => denomMainnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		blockHeight: bigint('block_height', { mode: 'bigint' }).notNull(),
		transactionHash: varchar('transaction_hash', { length: 64 }).notNull(),
		createdAt: timestamp('created_at').notNull(),
		success: boolean('success').notNull(),
	},
	(table) => [index('idx_did_mainnet_tx_op_did').on(table.transactionHash, table.operationType, table.didId)]
);

export const resourceMainnet = pgTable(
	'resource_mainnet',
	{
		id: serial('id').primaryKey().notNull(),
		resourceId: uuid('resource_id').notNull(),
		resourceType: varchar('resource_type').notNull(),
		resourceName: varchar('resource_name').notNull(),
		operationType: bigint('operation_type', { mode: 'bigint' })
			.notNull()
			.references(() => operationTypesMainnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		didId: varchar('did_id', { length: 54 }),
		feePayer: varchar('fee_payer', { length: 44 }).notNull(),
		amount: bigint('amount', { mode: 'bigint' }).notNull(),
		denom: bigint('denom', { mode: 'bigint' })
			.notNull()
			.references(() => denomMainnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		blockHeight: bigint('block_height', { mode: 'bigint' }).notNull(),
		transactionHash: varchar('transaction_hash', { length: 64 }).notNull(),
		createdAt: timestamp('created_at').notNull(),
		success: boolean('success').notNull(),
	},
	(table) => [
		index('idx_resource_mainnet_tx_op_resource').on(table.transactionHash, table.operationType, table.resourceId),
	]
);

export const denomMainnet = pgTable('denom_mainnet', {
	id: serial('id').primaryKey().notNull(),
	ledgerDenom: varchar('ledger_denom').notNull().unique(),
	friendlyDenom: denomsEnumMainnet('friendly_denom').notNull(),
	exponent: integer('exponent').notNull(),
	description: varchar('description').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }),
});

export const operationTypesMainnet = pgTable('operation_types_mainnet', {
	id: serial('id').primaryKey().notNull(),
	type: operationTypeEnumMainnet('type').unique().notNull(),
	description: varchar('description').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }),
});

// Testnet tables

export const didTestnet = pgTable(
	'did_testnet',
	{
		id: serial('id').primaryKey().notNull(),
		didId: varchar('did_id', { length: 54 }).notNull(),
		operationType: bigint('operation_type', { mode: 'bigint' })
			.notNull()
			.references(() => operationTypesTestnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		feePayer: varchar('fee_payer', { length: 44 }).notNull(),
		amount: bigint('amount', { mode: 'bigint' }).notNull(),
		denom: bigint('denom', { mode: 'bigint' })
			.notNull()
			.references(() => denomTestnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		blockHeight: bigint('block_height', { mode: 'bigint' }).notNull(),
		transactionHash: varchar('transaction_hash', { length: 64 }).notNull(),
		createdAt: timestamp('created_at').notNull(),
		success: boolean('success').notNull(),
	},
	(table) => [index('idx_did_testnet_tx_op_did').on(table.transactionHash, table.operationType, table.didId)]
);

export const resourceTestnet = pgTable(
	'resource_testnet',
	{
		id: serial('id').primaryKey().notNull(),
		resourceId: uuid('resource_id').notNull(),
		resourceType: varchar('resource_type').notNull(),
		resourceName: varchar('resource_name').notNull(),
		operationType: bigint('operation_type', { mode: 'bigint' })
			.notNull()
			.references(() => operationTypesTestnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		didId: varchar('did_id', { length: 54 }),
		feePayer: varchar('fee_payer', { length: 44 }).notNull(),
		amount: bigint('amount', { mode: 'bigint' }).notNull(),
		denom: bigint('denom', { mode: 'bigint' })
			.notNull()
			.references(() => denomTestnet.id, { onDelete: 'no action', onUpdate: 'no action' }),
		blockHeight: bigint('block_height', { mode: 'bigint' }).notNull(),
		transactionHash: varchar('transaction_hash', { length: 64 }).notNull(),
		createdAt: timestamp('created_at').notNull(),
		success: boolean('success').notNull(),
	},
	(table) => [
		index('idx_resource_testnet_tx_op_resource').on(table.transactionHash, table.operationType, table.resourceId),
	]
);

export const denomTestnet = pgTable('denom_testnet', {
	id: serial('id').primaryKey().notNull(),
	ledgerDenom: varchar('ledger_denom').notNull().unique(),
	friendlyDenom: denomsEnumTestnet('friendly_denom').notNull(),
	exponent: integer('exponent').notNull(),
	description: varchar('description').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }),
});

export const operationTypesTestnet = pgTable('operation_types_testnet', {
	id: serial('id').primaryKey().notNull(),
	type: operationTypeEnumTestnet('type').unique().notNull(),
	description: varchar('description').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }),
});
