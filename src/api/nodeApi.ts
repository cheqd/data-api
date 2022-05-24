import { Account } from "../types/node";

export class NodeApi {

    constructor(public readonly base_rest_api_url: string) {
    }

    async bank_get_total_supply_ncheq(): Promise<number> {
        let resp = await fetch(`${this.base_rest_api_url}/cosmos/bank/v1beta1/supply/ncheq`);
        let respJson = await resp.json() as { amount: { amount: number } };

        return respJson.amount.amount;
    }

    async auth_get_account(address: string): Promise<Account> {
        let resp = await fetch(`${this.base_rest_api_url}/cosmos/auth/v1beta1/accounts/${address}`);
        let respJson = await resp.json() as { account: Account };

        return respJson.account;
    }
}
