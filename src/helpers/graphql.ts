import { GraphQLVariables, GraphQLResponse } from '../types/graphql';

export class GraphQLClient {
	constructor(public readonly base_url: string) {}

	async query<T>(options: { query: string; variables?: GraphQLVariables } | string): Promise<T> {
		let req: { query: string; variables?: GraphQLVariables };

		if (typeof options === 'string') {
			req = { query: options };
		} else {
			req = options;
		}

		const resp = await fetch(this.base_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		});

		const json = (await resp.json()) as GraphQLResponse<T>;

		if (json.errors) {
			throw new Error(`Query failed: ${JSON.stringify(json.errors)}`);
		}

		return json.data as T;
	}
}
