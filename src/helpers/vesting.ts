import { Account } from '../types/node';
import { isContinuousVestingAccount, isDelayedVestingAccount } from './validate';

// Taken from our wallet app
export function calculateVesting(account: Account, t?: Date) {
	if (!t) {
		t = new Date();
	}

	if (isContinuousVestingAccount(account?.['@type'])) {
		const startsAt = account.start_time;
		const endsAt = account.base_vesting_account.end_time;

		const totalCoins = Number(account.base_vesting_account.original_vesting[0]?.amount);

		const elapsed = t.getTime() - new Date(startsAt * 1000).getTime();
		const delta = new Date(endsAt * 1000).getTime() - new Date(startsAt * 1000).getTime();

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

		const originalVesting = Number(account.base_vesting_account.original_vesting[0]?.amount);

		const doneRatio = t > new Date(endsAt) ? 1 : 0;
		const vested = Math.ceil(Number(originalVesting) * doneRatio);
		const vesting = Math.ceil(Number(originalVesting) * (1.0 - doneRatio));

		return {
			vested,
			vesting,
		};
	}
}
