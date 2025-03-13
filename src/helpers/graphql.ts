import { GraphQLVariables, GraphQLResponse } from '../types/graphql';

export class GraphQLClient {
	constructor(public readonly base_url: string) {}

	async query<T>(options: { query: string; variables?: GraphQLVariables } | string): Promise<T> {
		// Use let here to allow potential reassignment in error handling
		let req: { query: string; variables?: GraphQLVariables };

		if (typeof options === 'string') {
			req = { query: options };
		} else {
			req = options;
		}

		try {
			const resp = await fetch(this.base_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(req),
			});

			if (!resp.ok) {
				throw new Error(`GraphQL request failed with status ${resp.status}: ${resp.statusText}`);
			}

			const json = (await resp.json()) as GraphQLResponse<T>;

			if (json.errors) {
				throw new Error(`Query failed: ${JSON.stringify(json.errors)}`);
			}

			// Check if data exists before returning
			if (!json.data) {
				console.error('GraphQL response contained no data');
				// Return an empty object that matches the expected structure
				return {} as T;
			}

			return json.data as T;
		} catch (error) {
			console.error(`GraphQL query failed: ${error instanceof Error ? error.message : String(error)}`);
			console.error(`Query: ${typeof req.query === 'string' ? req.query.substring(0, 100) : 'Invalid query'}...`);
			// Return an empty object that won't break property access attempts
			return {} as T;
		}
	}
}
