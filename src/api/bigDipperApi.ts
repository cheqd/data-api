import { GraphQLClient } from "../helpers/graphql";
import { Account } from "../types/bigDipper";
import { Coin, ValidatorAggregateCountResponse } from "../types/node";

export class BigDipperApi {
	constructor(public readonly graphql_client: GraphQLClient) {
	}

	async get_accounts(addresses: string[]): Promise<Account[]> {
		let query = `query Account($addresses: [String], $utc: timestamp) {
			account(where: { address: { _in: $addresses } }) {
				address
				accountBalances: account_balances(limit: 1, order_by: { height: desc }) {
					coins
				}
				delegations {
					amount
				}
				unbonding: unbonding_delegations(
					where: { completion_timestamp: { _gt: $utc } }
				) {
					amount
				}
				redelegations(where: { completion_time: { _gt: $utc } }) {
					amount
				}
				delegationRewards: delegation_rewards {
					amount
				}
			}
		}`

		let params = {
			utc: new Date(),
			addresses
		}

		let resp = await this.graphql_client.query<{ account: Account[] }>(query, params);
		return resp.account;
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
}
