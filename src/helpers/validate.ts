// TODO: This doesn't take checksum into account
export function validate_cheqd_address(address: string): boolean {
    return /^(cheqd)1[a-z0-9]{38}$/.test(address)
}

export function is_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount' || account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount';
}

export function is_continuous_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
}

export function is_delayed_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount';
}

export function marked_as_delayed_vesting_account(address: string): boolean {
    return /^delayed:/.test(address);
}

export function filter_marked_as_account_types(addresses: string[]): Record<string, string[]> {
    return {
        delayed: addresses.filter(address => marked_as_delayed_vesting_account(address)).map(address => address.replace('delayed:', '')),
        other: addresses.filter(address => !marked_as_delayed_vesting_account(address)).map(address => address)
    };
}