import { Account } from "../types/bigDipper";
import { Coin } from "../types/node";

export function total_balance_ncheq(account: Account): number {
    let balance = Number(account?.accountBalance?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    let delegations = 0;
    if (account?.delegationBalance?.coins && account?.delegationBalance?.coins.length > 0) {
        delegations = Number(account?.delegationBalance?.coins[0].amount);
    }

    let unbonding = 0;
    if (account?.unbondingBalance?.coins && account?.unbondingBalance?.coins.length > 0) {
        unbonding = Number(account?.unbondingBalance?.coins[0]?.amount);
    }

    let rewards = 0;
    if (account?.rewardBalance?.coins && account?.rewardBalance?.coins.length > 0) {
        rewards = Number(account?.rewardBalance?.coins[0]?.amount);
    }

    return balance + delegations + unbonding + rewards;
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
