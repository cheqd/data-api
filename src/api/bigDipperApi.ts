import { GraphQLClient } from "../helpers/graphql";
import { Account } from "../types/bigDipper";
import { Coin } from "../types/node";

export class BigDipperApi {
    constructor(public readonly graphql_client: GraphQLClient) {
    }

    async get_accounts(addresses: string[]): Promise<Account[]> {
        let query = "query Account($addresses: [String], $utc: timestamp) {\n" +
            "  account(where: { address: { _in: $addresses } }) {\n" +
            "    address\n" +
            "    accountBalances: account_balances(limit: 1, order_by: { height: desc }) {\n" +
            "      coins\n" +
            "    }\n" +
            "    delegations {\n" +
            "      amount\n" +
            "    }\n" +
            "    unbonding: unbonding_delegations(\n" +
            "      where: { completion_timestamp: { _gt: $utc } }\n" +
            "    ) {\n" +
            "      amount\n" +
            "    }\n" +
            "    redelegations(where: { completion_time: { _gt: $utc } }) {\n" +
            "      amount\n" +
            "    }\n" +
            "    delegationRewards: delegation_rewards {\n" +
            "      amount\n" +
            "    }\n" +
            "  }\n" +
            "}\n";

        let params = {
            utc: new Date(),
            addresses
        }

        let resp = await this.graphql_client.query<{ account: Account[] }>(query, params);
        return resp.account;
    }

    async get_account(address: string): Promise<Account> {
        let accounts =  await this.get_accounts([address]);
        return accounts[0];
    }

    async get_total_supply(): Promise<Coin[]> {
        let query = "query Supply {\n" +
            "  supply(order_by: {height:desc} limit: 1) {\n" +
            "    coins\n" +
            "    height\n" +
            "  }\n" +
            "}\n";

        let resp = await this.graphql_client.query<{ supply: { coins: Coin[] }[] }>(query);
        return resp.supply[0].coins;
    }
}
