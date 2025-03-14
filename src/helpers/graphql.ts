import { GraphQLRequest, GraphQLResponseBase } from '../types/bigDipper';

export class GraphQLClient {
	constructor(public readonly base_url: string) {}

	async query<T extends object>(options: GraphQLRequest | string): Promise<T> {
		let req: GraphQLRequest;

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

		const json = (await resp.json()) as T & GraphQLResponseBase;

		if (json.errors) {
			throw new Error(`Query failed: ${JSON.stringify(json.errors)}`);
		}

		return json;
	}
}
