import { Coin } from "../types/node";

export function total_balance_ncheq(record: {
    account: { address: string }
    account_balance: { coins: Coin[] }
    delegations: { amount: Coin }[]
    unbonding: { amount: Coin }[]
    delegationRewards: { amount: Coin[] }[]
}): number {
    console.log({ record })
    let balance = Number(record.account_balance?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    let delegations = record?.delegations?.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    let unbonding = record?.unbonding?.map(d => d.amount)
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    let rewards = record?.delegationRewards?.map(d => d.amount)
        .flat()
        .filter(a => a.denom === "ncheq")
        .map(a => Number(a.amount))
        .reduce((a, b) => a + b, 0) ?? 0;

    return balance + delegations + unbonding + rewards;
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
