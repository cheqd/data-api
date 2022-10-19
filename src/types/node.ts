export type Account = {
  '@type': string;
  start_time: number;
  base_vesting_account: {
    base_account: BaseAccount;
    original_vesting: Coin[];
    delegated_free?: Coin[];
    delegated_vesting?: Coin[];
    end_time: number;
  };
};

export type BaseAccount = {
  address: string;
  pub_key: PublicKey;
  account_number: string;
  sequence: string;
};

export type PublicKey = {
  '@type': string;
  key: string;
};

export class Coin {
  public denom: string;
  public amount: string;

  constructor(denom: string, amount: string) {
    this.denom = denom;
    this.amount = amount;
  }
}

export class Delegation {
  public amount: Coin;
  public delegatorAddress: string;

  constructor(amount: Coin, delegatorAddress: string) {
    this.delegatorAddress = delegatorAddress;
    this.amount = amount;
  }
}

export interface ValidatorDelegationsCountResponse {
  delegations: {
    pagination: {
      total: number;
    };
  };
}

export interface ValidatorDetailResponse {
  delegation_responses: [
    {
      delegation: {
        delegator_address: string;
        validator_address: string;
      };
    }
  ];
}

export interface ActiveValidatorsResponse {
  validator_info: [
    {
      operator_address: string;
    }
  ];
}

export interface TotalStakedCoinsResponse {
  staking_pool: [
    {
      bonded_tokens: string;
    }
  ];
}

export interface AccountBalanceInfos {
  totalBalance: number;
  availiableBalance: number;
  rewards: number;
  delegated: number;
  unbounding: number;
  timeUpdated: string;
}
