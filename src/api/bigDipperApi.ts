import { GraphQLClient } from '../helpers/graphql';
import {
  ActiveValidatorsResponse,
  Coin,
  TotalStakedCoinsResponse,
  ValidatorDelegationsCountResponse,
} from '../types/node';
export class BigDipperApi {
  constructor(public readonly graphql_client: GraphQLClient) {}

  async get_total_supply(): Promise<Coin[]> {
    let query = `query Supply {
            supply(order_by: {height:desc} limit: 1) {
                coins
                height
            }
        }`;

    let resp = await this.graphql_client.query<{
      data: { supply: { coins: Coin[] }[] };
    }>(query);

    return resp.data.supply[0].coins;
  }

  get_delegator_count_for_validator = async (
    address: string
  ): Promise<Number> => {
    let query = `query ValidatorDelegations($address: String!, $pagination: Boolean! = true) {
        delegations: action_validator_delegations(address: $address, count_total: $pagination) {         
          pagination
        }
      }
      `;

    const params = {
      address: address,
    };

    const resp = await this.graphql_client.query<{
      data: ValidatorDelegationsCountResponse;
    }>(query, params);

    return resp.data.delegations.pagination.total;
  };

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
