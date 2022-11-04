import { Request } from 'itty-router';
import {
  isVestingAccount,
  isValidAddress,
} from '../helpers/validate';
import { NodeApi } from '../api/nodeApi';
import { calculateVesting } from '../helpers/vesting';
import { convertToMainTokenDenom } from '../helpers/currency';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];

  if (!address || !isValidAddress(address)) {
    throw new Error('No address specified or wrong address format.');
  }

  let api = new NodeApi(REST_API);
  const account = await api.getAccountInfo(address);

  if (!isVestingAccount(account['@type'])) {
    throw new Error(
      `Only vesting accounts are supported. Accounts type '${account['@type']}'.`
    );
  }

  let vested_coins = calculateVesting(account)?.vested;

  return new Response(convertToMainTokenDenom(vested_coins!!));
}
