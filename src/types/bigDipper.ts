export interface TotalSupplyResponse {
  supply: [
    {
      coins: [
        {
          denom: string;
          amount: string;
        }
      ];
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

export interface ActiveValidatorsResponse {
  validator_info: [
    {
      operator_address: string;
      validator: {
        validator_voting_powers: [
          {
            voting_power: number;
          }
        ];
      };
    }
  ];
}
