// TODO: This doesn't take checksum into account
export function validate_cheqd_address(address: string): boolean {
    return /^(cheqd)1[a-z0-9]{38}$/.test(address)
}

export function is_vesting_account_type(account_type: string): boolean {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
}