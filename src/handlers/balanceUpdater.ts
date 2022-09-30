import { Request } from "itty-router";
import { updateGroupBalances } from "./cron";

export async function handler(request: Request): Promise<Response> {
    const grp = request.params?.['grp'];

    console.log(`updating all account balances (group: ${grp})`)
    const res = await updateGroupBalances(Number(grp), {} as Event)
    if (res !== undefined) {
        return res
    }

    return new Response(JSON.stringify({
        error: new Error("this endpoint should be called for all accounts")
    }))
}
