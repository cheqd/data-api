import { TOKEN_DECIMALS } from "./constants";

export function convertToLowestDenom(ncheq: number): number {
    return ncheq / TOKEN_DECIMALS;
}

export function convertToMainTokenDenom(ncheq: number): string {
    return convertToLowestDenom(ncheq).toFixed(0);
}
