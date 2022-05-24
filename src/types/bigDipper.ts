import { Coin } from "./node";

export class Account {
    public accountBalances: { coins: Coin[] }[] = [];
    public delegations: { amount: Coin }[] = [];
    public unbonding: { amount: Coin }[] = [];
    public delegationRewards: { amount: Coin[] }[] = [];
}
