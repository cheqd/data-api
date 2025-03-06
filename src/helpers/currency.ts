export function convertToLowestDenom(ncheq: number, env: Env): number {
	return ncheq / 10 ** env.TOKEN_EXPONENT;
}

export function convertToMainTokenDenom(amount: number, exponent: number, decimals: number = 0): string {
	const converted = amount / Math.pow(10, exponent);
	
	if (decimals === 0) {
		return Math.round(converted).toString();
	} else {
		return converted.toFixed(decimals);
	}
}
