import { Coin } from "../types/node";
import { Record } from "../types/bigDipper";

export function total_balance_ncheq(record: Record): number {
    let balance = Number(record.account_balance?.coins.find(c => c.denom === "ncheq")?.amount || '0');

    console.log(record)
    // let delegations = record?.delegations?.map(d => d.amount)
    //     .filter(a => a.denom === "ncheq")
    //     .map(a => Number(a.amount))
    //     .reduce((a, b) => a + b, 0) ?? 0;
    //
    // let unbonding = record?.unbonding?.map(d => d.amount)
    //     .filter(a => a.denom === "ncheq")
    //     .map(a => Number(a.amount))
    //     .reduce((a, b) => a + b, 0) ?? 0;
    //
    // let rewards = record?.delegationRewards?.map(d => d.amount)
    //     .flat()
    //     .filter(a => a.denom === "ncheq")
    //     .map(a => Number(a.amount))
    //     .reduce((a, b) => a + b, 0) ?? 0;

    return balance;
    // return balance + delegations + unbonding + rewards;
}

export function delayed_balance_ncheq(balance: Coin[]): number {
    return Number(balance.find(c => c.denom === "ncheq")?.amount || '0');
}
