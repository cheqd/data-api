import { GraphQLClient } from "../helpers/graphql";
import { Coin, ValidatorAggregateCountResponse, ValidatorDetailResponse } from "../types/node";
import { Record, Records } from "../types/bigDipper";

export class BigDipperApi {
    constructor(public readonly graphql_client: GraphQLClient) {
    }

    async get_accounts(addresses: string[]): Promise<Records[]> {
        let query = `query Account($addresses: [String!]) {
            account(where: {address: {_in: $addresses}}) {
                address
            }
        }`

        let params = {
            addresses: addresses
        }

        let resp = await this.graphql_client.query(query, params);

        return resp as Records[]
    }

    async get_account(address: string): Promise<Record> {
        const record = await this.get_accounts([ address ]);

        const { account, account_balance, delegations, unbonding, delegationRewards } = record.data;

        if (account.length > 0) {
            return {
                account: account[0],
            } as Record;
        }

        return {} as Record
    }



    async get_total_supply(): Promise<Coin[]> {
        let query = `query Supply {
            supply(order_by: {height:desc} limit: 1) {
                coins
                height
            }
        }`;

        let resp = await this.graphql_client.query<{ supply: { coins: Coin[] }[] }>(query);

        console.log(resp)
        return resp.data.supply[0].coins;
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

        const resp = await this.graphql_client.query<{ staking_pool: [ { "bonded_tokens": string } ] }>(query);
        return resp.staking_pool[0].bonded_tokens;
    }
}
