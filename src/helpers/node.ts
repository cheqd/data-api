import { Account } from "../types/bigDipper";
import { Coin } from "../types/node";
import { ncheq_to_cheqd } from "./currency";

export function total_balance_ncheq(account: Account): number {
    let balance = Number(account?.accountBalance?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    let delegations = 0;
    if (account?.delegationBalance?.coins && account?.delegationBalance?.coins.length > 0) {
        delegations = ncheq_to_cheqd(account?.delegationBalance?.coins[0].amount);
    }

    let unbonding = 0;
    if (account?.unbondingBalance?.coins && account?.unbondingBalance?.coins.length > 0) {
        unbonding = ncheq_to_cheqd(account?.unbondingBalance?.coins[0]?.amount);
    }

    let rewards = 0;
    if (account?.rewardBalance?.coins && account?.rewardBalance?.coins.length > 0) {
        rewards = ncheq_to_cheqd(account?.rewardBalance?.coins[0]?.amount);
    }

    return Number(balance + delegations + unbonding + rewards);
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
