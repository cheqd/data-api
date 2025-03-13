import { GraphQLClient } from '../helpers/graphql';
import {
	TotalSupplyResponse,
	TotalStakedCoinsResponse,
	DidsResponse,
	ResourcesResponse,
	TransactionDetails,
	OperationType,
	OperationTypes,
	DidDocPayload,
	ResourcePayload,
	Fee,
} from '../types/bigDipper';

export class BigDipperApi {
	constructor(public readonly graphql_client: GraphQLClient) {}

	async getTotalSupply(): Promise<number> {
		try {
			const query = `query TotalSupply {
				supply {
						coins {
						denom
						amount
					}
				}
			}`;

			let result = 0;
			const response = await this.graphql_client.query<{
				supply: TotalSupplyResponse['supply'];
			}>(query);

			console.log('Total supply response:', JSON.stringify(response));

			if (response?.supply?.[0]?.coins) {
				const ncheqCoin = response.supply[0].coins.find((coin) => coin.denom === 'ncheq');
				if (ncheqCoin?.amount) {
					result = Number(ncheqCoin.amount);
					console.log(`Found ncheq coin with amount: ${result}`);
				} else {
					// Log available coins for debugging
					console.log('Available coins:', JSON.stringify(response.supply[0].coins));
				}
			} else {
				console.log('Supply data structure not as expected:', JSON.stringify(response));
			}

			return result;
		} catch (error) {
			console.error('Error fetching total supply:', error);
			throw error; // Re-throw to let the handler handle it
		}
	}

	getTotalStakedCoins = async (): Promise<string> => {
		try {
			const query = `query StakingInfo{
				staking_pool {
					bonded_tokens
				}
			}`;

			// Default value
			let result = '0';

			const resp = await this.graphql_client.query<{
				data: TotalStakedCoinsResponse;
			}>(query);

			if (resp?.data?.staking_pool?.[0]?.bonded_tokens) {
				result = resp.data.staking_pool[0].bonded_tokens;
			}

			return result;
		} catch (error) {
			console.error('Error fetching total staked coins:', error);
			return '0';
		}
	};

	async getDids(limit = 100, offset = 0, minHeight = 0): Promise<TransactionDetails[]> {
		const query = `
      query GetDids($limit: Int!, $offset: Int!, $minHeight: bigint!) {
        message(
          where: {
            type: {_in: [
              "${OperationTypes.CREATE_DID}",
              "${OperationTypes.UPDATE_DID}",
              "${OperationTypes.DEACTIVATE_DID}"
            ]},
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
				operationType: msg.type as OperationType,
				timestamp: msg.transaction.block.timestamp,
				didId: payload.id,
				feePayer: fee.payer,
				amount: fee.amount[0].amount,
				denom: fee.amount[0].denom,
				success: msg.transaction.success,
			};
		});
	}

	async getResources(limit = 100, offset = 0, minHeight = 0): Promise<TransactionDetails[]> {
		const query = `
      query GetResources($limit: Int!, $offset: Int!, $minHeight: bigint!) {
        message(
          where: {
            type: {_in: [
              "${OperationTypes.CREATE_RESOURCE}",
            ]},
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
				operationType: msg.type as OperationType,
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
