import { Account } from "../types/bigDipper";

export function total_balance_ncheq(account: Account): number {
    let balance = parseInt(account.accountBalances[0]?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    let delegations = account.delegations.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => parseInt(a.amount))
        .reduce((a, b) => a + b, 0);

    let unbonding = account.unbonding.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => parseInt(a.amount))
        .reduce((a, b) => a + b, 0);

    let rewards = account.delegationRewards.map(d => d.amount)
        .flat()
        .filter(a => a.denom === "ncheq")
        .map(a => parseInt(a.amount))
        .reduce((a, b) => a + b, 0);

    return balance + delegations + unbonding + rewards;
}
