export class GraphQLClient {
    constructor(public readonly base_url: string) {
    }

    async query<T>(query: string, variables: Object = {}): Promise<T> {
        let req = {
            query,
            variables,
        }

        let resp = await fetch(this.base_url, {
            method: "POST",
            body: JSON.stringify(req)
        })

        let json: { errors: any } = await resp.json()

        if (json.errors) {
            throw new Error(`query failed: ${json.errors}`)
        }

        return json as T;
    }
}
