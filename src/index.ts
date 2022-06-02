import { Router, Request, IHTTPMethods } from 'itty-router'
import { handler as totalSupplyHandler } from "./handlers/totalSupply";
import { handler as totalBalanceHandler } from "./handlers/totalBalance";
import { handler as circulatingSupplyHandler } from "./handlers/circulatingSupply";
import { handler as liquidBalanceHandler } from "./handlers/liquidBalance";
import { handler as vestingBalanceHandler } from "./handlers/vestingBalance";
import { handler as vestedBalanceHandler } from "./handlers/vestedBalance";

addEventListener('fetch', (event: FetchEvent) => {
    const router = Router<Request, IHTTPMethods>()
    registerRoutes(router);

    event.respondWith(router.handle(event.request).catch(handleError))
})

function registerRoutes(router: Router) {
    router.get('/', totalSupplyHandler);
    router.get('/supply/total', totalSupplyHandler);
    router.get('/supply/circulating', circulatingSupplyHandler);
    router.get('/balances/total/:address', totalBalanceHandler);
    router.get('/balances/liquid/:address', liquidBalanceHandler);
    router.get('/balances/vesting/:address', vestingBalanceHandler);
    router.get('/balances/vested/:address', vestedBalanceHandler);

    // 404 for all other requests
    router.all('*', () => new Response('Not Found.', {status: 404}))
}

function handleError(error: Error): Response {
    return new Response(error.message || 'Server Error', {status: 500})
}
