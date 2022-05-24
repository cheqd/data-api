import { TOKEN_DECIMALS } from "./constants";

export function ncheq_to_cheqd(ncheq: number): number {
    return ncheq / TOKEN_DECIMALS;
}

export function cheqd_to_ncheq(cheqd: number): number {
    return cheqd * TOKEN_DECIMALS;
}

export function ncheq_to_cheq_fixed(ncheq: number): string {
    return ncheq_to_cheqd(ncheq).toFixed(0);
}