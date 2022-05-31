export type Account ={
    '@type': string;
    start_time: number;
    base_vesting_account: { original_vesting: Coin[], end_time: number };
}

export class Coin {
    public denom: string;
    public amount: string;

    constructor(denom: string, amount: string) {
        this.denom = denom;
        this.amount = amount;
    }
}
