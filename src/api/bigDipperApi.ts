import { GraphQLClient } from '../helpers/graphql';
import {
	TotalSupplyResponse,
	TotalStakedCoinsResponse,
	DidsResponse,
	ResourcesResponse,
	DidTransactionDetails,
	ResourceTransactionDetails,
	OperationType,
	DidDocPayload,
	ResourcePayload,
	Fee,
} from '../types/bigDipper';
import { normalizeOperationType } from '../helpers/identity';

export class BigDipperApi {
	constructor(public readonly graphql_client: GraphQLClient) {}

	async getTotalSupply(): Promise<number> {
		const query = `query TotalSupply {
      supply {
        coins
      }
    }`;

		const resp = await this.graphql_client.query<{
			data: TotalSupplyResponse;
		}>(query);

		return Number(resp.data.supply[0].coins.find((coin) => coin.denom === 'ncheq')?.amount || '0');
	}

	getTotalStakedCoins = async (): Promise<string> => {
		const query = `query StakingInfo{
            staking_pool {
                bonded_tokens
            }
        }`;

		const resp = await this.graphql_client.query<{
			data: TotalStakedCoinsResponse;
		}>(query);
		return resp.data.staking_pool[0].bonded_tokens;
	};

	async getDids(limit = 100, offset = 0, minHeight = 0): Promise<DidTransactionDetails[]> {
		const query = `
      query GetDids($limit: Int!, $offset: Int!, $minHeight: bigint!) {
        message(
          where: {
            type: {_iregex: "^/?cheqd.did.v2"},
            height: {_gt: $minHeight}
          }
          limit: $limit
          offset: $offset
          order_by: {height: asc}
        ) {
          transaction_hash
          height
          type
          value
          transaction {
            block {
              timestamp
            }
            fee
            success
          }
        }
      }
    `;

		const resp = await this.graphql_client.query<{
			data: DidsResponse;
		}>({
			query,
			variables: { limit, offset, minHeight },
		});

		return resp.data.message.map((msg) => {
			const payload =
				typeof msg.value === 'string' ? JSON.parse(msg.value) : (msg.value.payload as DidDocPayload);

			const fee: Fee = msg.transaction.fee;

			return {
				transactionHash: msg.transaction_hash,
				blockHeight: msg.height,
				operationType: normalizeOperationType(msg.type) as OperationType,
				timestamp: msg.transaction.block.timestamp,
				didId: payload.id,
				feePayer: fee.payer,
				amount: fee.amount[0].amount,
				denom: fee.amount[0].denom,
				success: msg.transaction.success,
			};
		});
	}

	async getResources(limit = 100, offset = 0, minHeight = 0): Promise<ResourceTransactionDetails[]> {
		const query = `
      query GetResources($limit: Int!, $offset: Int!, $minHeight: bigint!) {
        message(
          where: {
            type: {_iregex: "^/?cheqd.resource.v2"},
            height: {_gt: $minHeight}
          }
          limit: $limit
          offset: $offset
          order_by: {height: asc}
        ) {
          transaction_hash
          height
          type
          value
          transaction {
            block {
              timestamp
            }
            fee
            success
          }
        }
      }
    `;

		const resp = await this.graphql_client.query<{
			data: ResourcesResponse;
		}>({
			query,
			variables: { limit, offset, minHeight },
		});

		return resp.data.message.map((msg) => {
			const payload =
				typeof msg.value === 'string' ? JSON.parse(msg.value) : (msg.value.payload as ResourcePayload);

			const fee: Fee = msg.transaction.fee;

			return {
				transactionHash: msg.transaction_hash,
				blockHeight: msg.height,
				operationType: normalizeOperationType(msg.type) as OperationType,
				timestamp: msg.transaction.block.timestamp,
				didId: payload.collection_id,
				resourceId: payload.id,
				resourceType: payload.resource_type,
				resourceName: payload.name,
				feePayer: fee.payer,
				amount: fee.amount[0].amount,
				denom: fee.amount[0].denom,
				success: msg.transaction.success,
			};
		});
	}
}
