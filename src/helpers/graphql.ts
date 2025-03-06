export class GraphQLClient {
	constructor(public readonly base_url: string) {}

	async query<T>(options: { query: string; variables?: any } | string): Promise<T> {
		let req: { query: string; variables?: any };

		if (typeof options === 'string') {
			req = { query: options };
		} else {
			req = options;
		}

		let resp = await fetch(this.base_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		});

		let json = await resp.json() as any;

		if (json.errors) {
			throw new Error(`Query failed: ${JSON.stringify(json.errors)}`);
		}

		return json as T;
	}
}
