import { Network } from '../types/network';

// TODO: This doesn't take checksum into account
export function isValidAddress(address: string): boolean {
	return /^(cheqd)1[a-z0-9]{38}$/.test(address);
}

export function isVestingAccount(account_type: string): boolean {
	return (
		account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount' ||
		account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount'
	);
}

export function isContinuousVestingAccount(account_type: string): boolean {
	return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
}

export function isDelayedVestingAccount(account_type: string): boolean {
	return account_type === '/cosmos.vesting.v1beta1.DelayedVestingAccount';
}

// Validate cheqd address format
export function validateFeePayer(feePayer: string): boolean {
	const feePayerRegex = /^cheqd1[a-zA-Z0-9]{38}$/;
	return feePayerRegex.test(feePayer);
}

// Validate DID ID format
export function validateDidId(didId: string, network: Network): boolean {
	const networkStr = network === Network.MAINNET ? 'mainnet' : 'testnet';
	const uuidRegex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
	const didRegex = new RegExp(`^did:cheqd:${networkStr}:${uuidRegex}$`);
	return didRegex.test(didId);
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class DateValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DateValidationError';
	}
}

export function normalizeDate(dateStr: string): Date {
	// If only YYYY-MM-DD provided, assume start of day UTC
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		dateStr = `${dateStr}T00:00:00Z`;
	}

	const date = new Date(dateStr);

	if (isNaN(date.getTime())) {
		throw new DateValidationError(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD or ISO 8601 format.`);
	}

	return date;
}

export function getDefaultDateRange(): { start: Date; end: Date } {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 30); // Last 30 days
	return { start, end };
}

/**
 * Validates and normalizes date range
 * - No dates provided: returns last 30 days
 * - Only start date: uses current time as end date
 * - Both dates: validates start is before end
 * @throws DateValidationError if dates are invalid
 */
export function validateDateRange(startDate?: string | null, endDate?: string | null): { start: Date; end: Date } {
	// Case 1: No dates provided - return last 30 days
	if (!startDate && !endDate) {
		return getDefaultDateRange();
	}

	const now = new Date();
	let start: Date;
	let end: Date;

	// Case 2: Only start date provided - use current time as end
	if (startDate && !endDate) {
		start = normalizeDate(startDate);
		if (start > now) {
			throw new DateValidationError(
				`Start date (${startDate}) cannot be in the future. Current UTC time is ${now.toISOString()}`
			);
		}
		end = now;
		return { start, end };
	}

	// Case 3: Both dates provided
	if (startDate && endDate) {
		start = normalizeDate(startDate);
		end = normalizeDate(endDate);
		if (start > end) {
			throw new DateValidationError(`Start date (${startDate}) must be before end date (${endDate})`);
		}

		if (end > now) {
			throw new DateValidationError(
				`End date (${endDate}) cannot be in the future. Current UTC time is ${now.toISOString()}`
			);
		}

		return { start, end };
	}

	// Case 4: Only end date provided - use last 30 days before end date
	end = endDate ? normalizeDate(endDate) : now;
	if (end > now) {
		throw new DateValidationError(
			`End date (${endDate}) cannot be in the future. Current UTC time is ${now.toISOString()}`
		);
	}
	start = new Date(end);
	start.setDate(end.getDate() - 30);

	return { start, end };
}
