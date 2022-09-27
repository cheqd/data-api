import { Coin } from "./node";

export class Account {
    public accountBalance: { coins: Coin[] };
    public delegationBalance: { coins: Coin[] };
    public unbondingBalance: { coins: Coin[] };
    public rewardBalance: { coins: Coin[] };
    public vesting_account: {
        id: string,
        type: string,
        original_vesting: Coin[],
        start_time: number,
        end_time: number
    }[];

    constructor(
        account_balance: { coins: Coin[] },
        delegation_balance: { coins: Coin[] },
        unbonding_balance: { coins: Coin[] },
        reward_balance: { coins: Coin[] },
        vesting_account: {
            id: string,
            type: string,
            original_vesting: Coin[],
            start_time: number,
            end_time: number
        }[]) {
        this.accountBalance = account_balance;
        this.delegationBalance = delegation_balance;
        this.unbondingBalance = unbonding_balance;
        this.rewardBalance = reward_balance;
        this.vesting_account = vesting_account;
    }
}

