import { Request } from "itty-router";
import { updateAllBalances } from "./cron";

export async function handler(request: Request): Promise<Response> {
    const grp = request.params?.['grp'];

    console.log(`updating all account balances (group: ${grp})`)
    const res = await updateAllBalances(Number(grp), {} as Event)
    if (res !== undefined) {
        return res
    }
}


