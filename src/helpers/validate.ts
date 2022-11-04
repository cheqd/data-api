// TODO: This doesn't take checksum into account
export function isValidAddress(address: string): boolean {
    return /^(cheqd)1[a-z0-9]{38}$/.test(address)
}

export function isVestingAccount(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount' || account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount';
}

export function is_continuous_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
}

export function is_delayed_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount';
}
