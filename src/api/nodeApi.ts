import {
  Account,
  Coin,
  DelegationsResponse,
  UnbondingResponse,
  ValidatorDetailResponse,
} from '../types/node';

export class NodeApi {
  constructor(public readonly base_rest_api_url: string) {}

  async bank_get_total_supply_ncheq(): Promise<number> {
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/bank/v1beta1/supply/ncheq`
    );
    let respJson = (await resp.json()) as { amount: { amount: number } };

    return respJson.amount.amount;
  }

  async auth_get_account(address: string): Promise<Account> {
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/auth/v1beta1/accounts/${address}`
    );
    let respJson = (await resp.json()) as { account: Account };

    return respJson.account;
  }

  async bank_get_account_balances(address: string): Promise<Coin[]> {
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/bank/v1beta1/balances/${address}`
    );
    let respJson = (await resp.json()) as { balances: Coin[] };

    return respJson.balances;
  }

  async distribution_get_total_rewards(address: string): Promise<number> {
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/distribution/v1beta1/delegators/${address}/rewards`
    );
    let respJson = (await resp.json()) as {
      rewards: Record<string, any>[];
      total: Coin[];
    };

    return Number(respJson?.total?.[0]?.amount ?? '0');
  }

  async staking_get_delegators_per_validator(
    address: string
  ): Promise<ValidatorDetailResponse> {
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/staking/v1beta1/validators/${address}/delegations?pagination.limit=10000`
    );

    return await resp.json();
  }

  async staking_get_all_delegations_for_delegator(
    address: string,
    next_key?: string
  ) {
    const resp = await fetch(
      `${this.base_rest_api_url}/cosmos/staking/v1beta1/delegations/${address}${
        next_key ? `?pagination.key=${next_key}` : ''
      }`
    );

    return (await resp.json()) as DelegationsResponse;
  }

  async staking_get_all_unboding_delegations_for_delegator(
    address: string,
    next_key?: string
  ) {
    const resp = await fetch(
      `${
        this.base_rest_api_url
      }/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations${
        next_key ? `?pagination.key=${next_key}` : ''
      }`
    );

    return (await resp.json()) as UnbondingResponse;
  }

  async get_latest_block_height(): Promise<number> {
    const resp = await fetch(`${this.base_rest_api_url}/blocks/latest`);
    let respJson = (await resp.json()) as {
      block: { header: { height: number } };
    };
    return Number(respJson.block.header.height);
  }
}
