import {
  Account,
  Coin,
  DelegationsResponse,
  UnbondingResponse,
  RewardsResponse,
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
    let respJson = (await resp.json()) as RewardsResponse;

    return Number(respJson?.total?.[0]?.amount ?? '0');
  }

  async staking_get_delegators_per_validator(
    address: string,
    offset: number,
    should_count_total: boolean,
    limit?: number
  ): Promise<ValidatorDetailResponse> {
    // order of query params: count_total -> offset -> limit
    const pagination_count_total = should_count_total
      ? 'pagination.count_total=true'
      : 'pagination.count_total=false';
      const pagination_limit = `pagination.limit=${
        limit ? limit : REST_API_PAGINATION_LIMIT
      }`;
    const pagination_offset = `pagination.offset=${offset}`;
    // NOTE: be cautious of newlines or spaces. Might make the request URL malformed
    let resp = await fetch(
      `${this.base_rest_api_url}/cosmos/staking/v1beta1/validators/${address}/delegations?${pagination_count_total}&${pagination_limit}&${pagination_offset}`
    );
    console.log(resp.url);
    return (await resp.json()) as ValidatorDetailResponse;
  }

  async staking_get_all_delegations_for_delegator(
    address: string,
    offset: number,
    should_count_total: boolean,
    limit?: number
  ) {
    // order of query params: count_total -> offset -> limit
    const pagination_count_total = should_count_total
      ? 'pagination.count_total=true'
      : 'pagination.count_total=false';
    const pagination_limit = `pagination.limit=${
      limit ? limit : REST_API_PAGINATION_LIMIT
    }`;
    const pagination_offset = `pagination.offset=${offset}`;
    // NOTE: be cautious of newlines or spaces. Might make the request URL malformed
    const resp = await fetch(
      `${this.base_rest_api_url}/cosmos/staking/v1beta1/delegations/${address}?${pagination_count_total}&${pagination_limit}&${pagination_offset}`
    );

    console.log(`Response status for delegator count ${resp.status}`);

    return (await resp.json()) as DelegationsResponse;
  }

  async staking_get_all_unbonding_delegations_for_delegator(
    address: string,
    offset: number,
    should_count_total: boolean
  ) {
    // order of query params: count_total -> offset -> limit
    const pagination_count_total = should_count_total
      ? 'pagination.count_total=true'
      : 'pagination.count_total=false';
    const pagination_limit = `pagination.limit=${REST_API_PAGINATION_LIMIT}`;
    const pagination_offset = `pagination.offset=${offset}`;
    // NOTE: be cautious of new lines or spaces. Might make the request URL malformed
    const resp = await fetch(
      `${this.base_rest_api_url}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations?${pagination_count_total}&${pagination_limit}&${pagination_offset}`
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
