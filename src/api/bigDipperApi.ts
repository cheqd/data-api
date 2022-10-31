import { GraphQLClient } from '../helpers/graphql';
import { TotalSupplyResponse } from '../types/bigDipper';
import {
  ActiveValidatorsResponse,
  TotalStakedCoinsResponse,
  ValidatorDelegationsCountResponse,
} from '../types/node';

export class BigDipperApi {
  constructor(public readonly graphql_client: GraphQLClient) {}

  async get_total_supply(): Promise<number> {
    let query = `query TotalSupply {
      supply {
        coins
      }
    }`;

    let resp = await this.graphql_client.query<{
      data: TotalSupplyResponse;
    }>(query);

    return Number(
      resp.data.supply[0].coins.find((coin) => coin.denom === 'ncheq')
        ?.amount || '0'
    );
  }


  get_active_validators = async (): Promise<ActiveValidatorsResponse> => {
    const queryActiveValidators = `query ActiveValidators {
        validator_info(distinct_on: operator_address, where: {validator: {validator_statuses: {jailed: {_eq: false}}}}) {
          operator_address
        }
      }`;
    const activeValidator = await this.graphql_client.query<{
      data: ActiveValidatorsResponse;
    }>(queryActiveValidators);
    return activeValidator.data;
  };

  get_total_staked_coins = async (): Promise<string> => {
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
