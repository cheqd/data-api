export class Account {
    public '@type': string;
    public start_time: number;
    public base_vesting_account: { original_vesting: Coin[], end_time: number };

    constructor(start_time: number, base_vesting_account: { original_vesting: Coin[], end_time: number }) {
        this.start_time = start_time;
        this.base_vesting_account = base_vesting_account;
    }
}

export class Coin {
    public denom: string;
    public amount: string;

    constructor(denom: string, amount: string) {
        this.denom = denom;
        this.amount = amount;
    }
}
