import { Coin } from "./node";

export class Record {
    public account: { address: String }[];
    public account_balance: { coins: Coin[] }[];
    public delegations: { amount: Coin }[];
    public unbonding: { amount: Coin }[];
    public delegationRewards: { amount: Coin[] }[];

    constructor(account: { address: String }[], account_balance: { coins: Coin[] }[], delegations: { amount: Coin }[], unbonding: { amount: Coin }[], delegationRewards: { amount: Coin[] }[]) {
        this.account = account;
        this.account_balance = account_balance;
        this.delegations = delegations;
        this.unbonding = unbonding;
        this.delegationRewards = delegationRewards;
    }
}
