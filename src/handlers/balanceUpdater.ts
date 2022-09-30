import { Request } from "itty-router";
import { updateGroupBalances } from "../helpers/balanceGroup";

export async function handler(request: Request): Promise<Response> {
    const grp = request.params?.['grp'];

    if (grp !== null) {
        console.log(`updating all account balances (group: ${grp})`)
        try {
            return updateGroupBalances(Number(grp), {} as Event)
        } catch (e: any) {
            console.log(new Map(e))
            return new Response(JSON.stringify(new Map(e)))
        }
    }

    return new Response("group is missing")
}
