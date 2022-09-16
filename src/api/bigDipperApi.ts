import { GraphQLClient } from "../helpers/graphql";
import { Account } from "../types/bigDipper";
import { Coin, Delegation, ValidatorAggregateCountResponse, ValidatorDetailResponse } from "../types/node";

export class BigDipperApi {
    constructor(public readonly graphql_client: GraphQLClient) {
    }

    async get_accounts(addresses: string[]): Promise<Account[]> {
        let query = `query Account($addresses: [String], $utc: timestamp) {
                          account(where: {address: {_in: $addresses}}) {
                            address
                          }
                          accountBalances: action_account_balance(where: {address: {_in: $addresses}}) {
                            address
                          }
                          delegations: action_delegation(where: {address: {_in: $addresses}}) {
                            address
                          }
                          unbondingBalance: action_unbonding_delegation_total(where: {address: {_in: $addresses}}) {
                            address
                          }
                          redelegations: action_redelegation(where: {address: {_in: $addresses}}, limit: $limit, offset: $offset, count_total: $pagination) {
                            redelegations
                            pagination
                          }
                          delegationRewards: action_delegation_reward(where: {address: {_in: $addresses}}) {
                            validator_address
                            coins
                          }
                        }
                    }`

        let params = {
            // utc: new Date(),
            addresses
        }


        try {
            let resp = await this.graphql_client.query<{ account: Account[] }>(query, params);
            return resp.account;
        } catch (e) {
            console.error(JSON.stringify(e))
        }

        return [];
    }

    async get_account(address: string): Promise<Account> {
        let accounts = await this.get_accounts([address]);
        return accounts[0];
    }

    async get_total_supply(): Promise<Coin[]> {
        let query = `query Supply {
            supply(order_by: {height:desc} limit: 1) {
                coins
                height
            }
        }`;

        let resp = await this.graphql_client.query<{ supply: { coins: Coin[] }[] }>(query);
        return resp.supply[0].coins;
    }

    get_delegator_count_for_validator = async (address: string): Promise<Number> => {
        let query = `query ValidatorDetails($address: String) {
            validator(where: {validator_info: {operator_address: {_eq: $address}}}) {
                delegations_aggregate {
                    aggregate {
                        count
                    }
                }
            }
        }`

        const params = {
            address: address,
        }

        const resp = await this.graphql_client.query<ValidatorAggregateCountResponse>(query, params);
        if (!resp.validator || !resp.validator.length) {
            return 0;
        }

        return resp.validator[0].delegations_aggregate.aggregate.count;
    }

    get_total_delegator_count = async (): Promise<Number> => {
        const query = `query ValidatorDetails {
            validator {
                validatorStatuses: validator_statuses(order_by: {height: desc}, limit: 1) {
                    jailed
                }
                delegations {
                    delegatorAddress: delegator_address
                }
            }
        }`

        const resp = await this.graphql_client.query<ValidatorDetailResponse>(query);
        const set = new Set();
        resp.validator.forEach((obj, i) => {
            if (!obj.validatorStatuses[0]?.jailed) {
                obj.delegations.forEach(delegation => {
                    set.add(delegation.delegatorAddress)
                })
            }
        })

        return set.size
    }

    get_total_staked_coins = async (): Promise<string> => {
        let query = `query StakingInfo{
            staking_pool {
                bonded_tokens
            }
        }`

        const resp = await this.graphql_client.query<{ staking_pool: [{ "bonded_tokens": string }] }>(query);
        return resp.staking_pool[0].bonded_tokens;
    }
}
