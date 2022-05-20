export class AnekaApi {

    constructor(public readonly base_api_url: string) {
    }

    async fetch_total_account_balance(address: string): Promise<number> {
        let resp = await fetch(`${this.base_api_url}/accounts/${address}`);

        let respJson = await resp.json() as { data: { balance: { total: number } } };

        return respJson.data.balance.total;
    }
}
