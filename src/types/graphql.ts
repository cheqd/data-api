export interface GraphQLVariables {
	[key: string]: unknown;
}

export interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: string[];
		extensions?: Record<string, unknown>;
	}>;
}
