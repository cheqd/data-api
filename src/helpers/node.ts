import { Account } from "../types/bigDipper";
import { Coin } from "../types/node";

export function total_balance_ncheq(account: Account): number {
    let balance = Number(account?.accountBalances[0]?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    let delegations = account?.delegations?.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    let unbonding = account?.unbonding?.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    let rewards = account?.delegationRewards?.map(d => d.amount)
        .flat()
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    return balance + delegations + unbonding + rewards;
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
