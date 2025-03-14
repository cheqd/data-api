export type Account = {
	'@type': string;
	start_time: number;
	base_vesting_account: {
		base_account: BaseAccount;
		original_vesting: Coin[];
		delegated_free?: Coin[];
		delegated_vesting?: Coin[];
		end_time: number;
	};
};

export type BaseAccount = {
	address: string;
	pub_key: PublicKey;
	account_number: string;
	sequence: string;
};

export type PublicKey = {
	'@type': string;
	key: string;
};

export class Coin {
	public denom: string;
	public amount: string;

	constructor(denom: string, amount: string) {
		this.denom = denom;
		this.amount = amount;
	}
}

export interface ValidatorDetailResponse {
	delegation_responses: [
		{
			delegation: {
				delegator_address: string;
				validator_address: string;
				shares: string;
			};
			balance: {
				denom: string;
				amount: string;
			};
		},
	];
	pagination: {
		next_key: string;
		total: string;
	};
}

export interface AccountBalanceInfos {
	totalBalance: number;
	availableBalance: number;
	rewards: number;
	delegated: number;
	unbonding: number;
	timeUpdated: string;
}

export interface DelegationsResponse {
	delegation_responses: [
		{
			delegation: {
				delegator_address: string;
				validator_address: string;
				shares: string;
			};
			balance: {
				denom: string;
				amount: string;
			};
		},
	];
	pagination: {
		next_key: string;
		total: string;
	};
}

export interface UnbondingResponse {
	unbonding_responses: [
		{
			delegator_address: string;
			validator_address: string;
			entries: [
				{
					creation_height: string;
					completion_time: string;
					initial_balance: string;
					balance: string;
				},
			];
		},
	];
	pagination: {
		next_key: string;
		total: string;
	};
}

// Define the structure of rewards record
interface ValidatorRewards {
	validator_address: string;
	reward: {
		denom: string;
		amount: string;
	}[];
}

export interface RewardsResponse {
	rewards: ValidatorRewards[];
	total: Coin[];
}
