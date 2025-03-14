export interface TotalSupplyResponse {
	supply: [
		{
			coins: [
				{
					denom: string;
					amount: string;
				},
			];
		},
	];
}

export interface TotalStakedCoinsResponse {
	staking_pool: [
		{
			bonded_tokens: string;
		},
	];
}

export interface ActiveValidatorsResponse {
	validator_info: [
		{
			operator_address: string;
		},
	];
}

export interface DidDocPayload {
	id: string;
}

export interface ResourcePayload {
	id: string;
	name: string;
	collection_id: string;
	resource_type: string;
}

export interface Fee {
	payer: string;
	amount: {
		denom: string;
		amount: string;
	}[];
}

export interface Transaction {
	fee: Fee;
	block: {
		timestamp: string;
	};
	success: boolean;
}

export interface Message {
	height: number;
	type: OperationType;
	transaction_hash: string;
	value: {
		payload: DidDocPayload | ResourcePayload;
	};
	transaction: Transaction;
}

export interface DidsResponse {
	message: Message[];
}

export interface ResourcesResponse {
	message: Message[];
}

export interface DidTransactionDetails {
	transactionHash: string;
	blockHeight: number;
	operationType: OperationType;
	timestamp: string;
	didId: string;
	feePayer: string;
	amount: string;
	denom: string;
	success: boolean;
}

export interface ResourceTransactionDetails {
	transactionHash: string;
	blockHeight: number;
	operationType: OperationType;
	timestamp: string;
	didId: string;
	feePayer: string;
	amount: string;
	denom: string;
	resourceId: string;
	resourceType: string;
	resourceName: string;
	success: boolean;
}

export const OperationTypes = {
	CREATE_DID: 'cheqd.did.v2.MsgCreateDidDoc',
	UPDATE_DID: 'cheqd.did.v2.MsgUpdateDidDoc',
	DEACTIVATE_DID: 'cheqd.did.v2.MsgDeactivateDidDoc',
	CREATE_RESOURCE: 'cheqd.resource.v2.MsgCreateResource',
} as const;

export type OperationType = (typeof OperationTypes)[keyof typeof OperationTypes];

export const DenomTypes = {
	NCHEQ: 'ncheq',
} as const;

export type DenomType = (typeof DenomTypes)[keyof typeof DenomTypes];

// Add this enum for friendly operation types
export enum FriendlyOperationType {
	CREATE_DID = 'createDid',
	UPDATE_DID = 'updateDid',
	DEACTIVATE_DID = 'deactivateDid',
	CREATE_RESOURCE = 'createResource',
}

// GraphQL related types
export type GraphQLVariables = Record<string, unknown>;

export interface GraphQLRequest {
	query: string;
	variables?: GraphQLVariables;
}

export interface GraphQLResponseBase {
	errors?: Array<{ message: string; locations?: unknown[]; path?: string[]; extensions?: unknown }>;
}
