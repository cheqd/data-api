import { GraphQLClient } from '../helpers/graphql';
import { TotalSupplyResponse, TotalStakedCoinsResponse, ActiveValidatorsResponse } from '../types/bigDipper';

export class BigDipperApi {
	constructor(public readonly graphql_client: GraphQLClient) {}

	async getTotalSupply(): Promise<number> {
		let query = `query TotalSupply {
      supply {
        coins
      }
    }`;

		let resp = await this.graphql_client.query<{
			data: TotalSupplyResponse;
		}>(query);

		return Number(resp.data.supply[0].coins.find((coin) => coin.denom === 'ncheq')?.amount || '0');
	}

	getTotalStakedCoins = async (): Promise<string> => {
		let query = `query StakingInfo{
            staking_pool {
                bonded_tokens
            }
        }`;

		const resp = await this.graphql_client.query<{
			data: TotalStakedCoinsResponse;
		}>(query);
		return resp.data.staking_pool[0].bonded_tokens;
	};
}
