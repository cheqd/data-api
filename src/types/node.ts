export type Account ={
    '@type': string;
    start_time: number;
    base_vesting_account: { base_account: BaseAccount, original_vesting: Coin[], delegated_free?: Coin[], delegated_vesting?: Coin[], end_time: number };
}

export type BaseAccount = {
    address: string;
    pub_key: PublicKey;
    account_number: string;
    sequence: string;
}

export type PublicKey = {
    '@type': string;
    key: string;
}

export class Coin {
    public denom: string;
    public amount: string;

    constructor(denom: string, amount: string) {
        this.denom = denom;
        this.amount = amount;
    }
}
