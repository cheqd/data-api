import { Request } from "itty-router";
import { updateGroupBalances } from "../helpers/balanceGroup";

export async function handler(request: Request): Promise<Response> {
    const grp = request.params?.['grp'];

    if (grp !== null) {
        console.log(`updating all account balances (group: ${grp})`)
        const result = await updateGroupBalances(Number(grp), {} as Event)

        console.log({ result })
        return new Response(JSON.stringify(result));
    }

    return new Response("group is missing")
}
