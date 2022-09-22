export class GraphQLClient {
    constructor(public readonly base_url: string) {
    }

    async query<T>(query: string, variables: Object = {}): Promise<T> {
        let req = {
            query,
            variables,
        }

        try {
            let resp = await fetch(this.base_url, {
                method: "POST",
                body: JSON.stringify(req)
            })

            let json = await resp.json()

            if (json.errors) {
                console.error(json.errors)
                return {} as T;
            }

            return json as T;
        } catch (e) {
            console.error(JSON.stringify(e))
            return {} as T;
        }
    }
}
