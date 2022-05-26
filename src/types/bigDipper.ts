import { Coin } from "./node";

export class Account {
    public accountBalances: { coins: Coin[] }[];
    public delegations: { amount: Coin }[];
    public unbonding: { amount: Coin }[];
    public delegationRewards: { amount: Coin[] }[];

    constructor(accountBalances: { coins: Coin[] }[], delegations: { amount: Coin }[], unbonding: { amount: Coin }[], delegationRewards: { amount: Coin[] }[]) {
        this.accountBalances = accountBalances;
        this.delegations = delegations;
        this.unbonding = unbonding;
        this.delegationRewards = delegationRewards;
    }
}
