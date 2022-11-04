import { Account } from '../types/node';
import {
  isContinuousVestingAccount,
  isDelayedVestingAccount,
} from './validate';

// TODO: This method computes the amount of coins vested. This is not the same as coins that user can spend.
//  To calculate spendable tokens we need to take into account initial balance + sent and received tokens as well.
//  Here is the explanation of how to do it properly:
//  https://docs.cosmos.network/master/modules/auth/05_vesting.html#transferring-sending
export function calculate_vested_coins(account: Account): number {
  if (
    account?.['@type'] === '/cosmos.vesting.v1beta1.DelayedVestingAccount' &&
    Date.now() < account?.base_vesting_account?.end_time * 1000
  )
    return 0;

  const start_time = new Date(account.start_time * 1000).getTime();
  const end_time = new Date(
    account.base_vesting_account.end_time * 1000
  ).getTime();
  const now = new Date().getTime();

  const time_elapsed = Math.abs(now - start_time) / 1000;
  const time_vested = Math.abs(end_time - start_time) / 1000;

  const ratio = Number(time_elapsed / time_vested);

  return (
    ratio * Number(account.base_vesting_account.original_vesting[0].amount)
  );
}

export function calculate_vesting_coins(account: Account): number {
  return (
    Number(account.base_vesting_account.original_vesting[0].amount) -
    calculate_vested_coins(account)
  );
}

// Taken from our wallet app
export function estimatedVesting(account: Account, t?: Date) {
  if (!t) {
    t = new Date();
  }

  if (isContinuousVestingAccount(account?.['@type'])) {
    const startsAt = account.start_time;
    const endsAt = account.base_vesting_account.end_time;

    const totalCoins = Number(
      account.base_vesting_account.original_vesting[0]?.amount
    );

    const elapsed = t.getTime() - new Date(startsAt * 1000).getTime();
    const delta =
      new Date(endsAt * 1000).getTime() - new Date(startsAt * 1000).getTime();

    const doneRatio = Math.min(1.0, Math.max(0, elapsed / delta));
    const vested = Math.ceil(Number(totalCoins) * doneRatio);
    const vesting = Math.ceil(Number(totalCoins) * (1.0 - doneRatio));

    return {
      vested,
      vesting,
    };
  }
  if (isDelayedVestingAccount(account?.['@type'])) {
    const endsAt = account.base_vesting_account.end_time;

    const originalVesting = Number(
      account.base_vesting_account.original_vesting[0]?.amount
    );

    const doneRatio = t > new Date(endsAt) ? 1 : 0;
    const vested = Math.ceil(Number(originalVesting) * doneRatio);
    const vesting = Math.ceil(Number(originalVesting) * (1.0 - doneRatio));

    return {
      vested,
      vesting,
    };
  }
}
