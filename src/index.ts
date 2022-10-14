import { Router, Request, IHTTPMethods } from 'itty-router';
import { handler as totalSupplyHandler } from './handlers/totalSupply';
import { handler as totalBalanceHandler } from './handlers/totalBalance';
import { handler as circulatingSupplyHandler } from './handlers/circulatingSupply';
import { handler as liquidBalanceHandler } from './handlers/liquidBalance';
import { handler as vestingBalanceHandler } from './handlers/vestingBalance';
import { handler as vestedBalanceHandler } from './handlers/vestedBalance';
import { handler as delegatorCountHandler } from './handlers/delegatorCount';
import { handler as totalDelegatorsHandler } from './handlers/totalDelegators';
import { handler as totalStakedCoinsHandler } from './handlers/totalStakedCoins';
import { handler as allArbitrageOpportunitiesHandler } from './handlers/allArbitrageOpportunities';
import { handler as arbitrageOpportunitiesHandler } from './handlers/arbitrageOpportunities';
import { webhookTriggers } from './handlers/webhookTriggers';

addEventListener('scheduled', (event: any) => {
  event.waitUntil(webhookTriggers(event));
});

addEventListener('fetch', (event: FetchEvent) => {
  const router = Router<Request, IHTTPMethods>();
  registerRoutes(router);
  event.respondWith(router.handle(event.request).catch(handleError));
});

function registerRoutes(router: Router) {
  router.get('/', totalSupplyHandler);
  router.get('/arbitrage', arbitrageOpportunitiesHandler);
  router.get('/arbitrage/all', allArbitrageOpportunitiesHandler);
  router.get('/balances/liquid/:address', liquidBalanceHandler);
  router.get('/balances/total/:address', totalBalanceHandler);
  router.get('/balances/vested/:address', vestedBalanceHandler);
  router.get('/balances/vesting/:address', vestingBalanceHandler);
  router.get('/staking/delegators/total', totalDelegatorsHandler);
  router.get('/staking/delegators/:validator_address', delegatorCountHandler);
  router.get('/supply/circulating', circulatingSupplyHandler);
  router.get('/supply/staked', totalStakedCoinsHandler);
  router.get('/supply/total', totalSupplyHandler);

  // 404 for all other requests
  router.all('*', () => new Response('Not Found.', { status: 404 }));
}

function handleError(error: Error): Response {
  return new Response(error.message || 'Server Error', { status: 500 });
}

function getRandomGroup(): number {
  const hour = new Date().getHours();

  if (hour > 0 && hour < 6) {
    return 1;
  }

  if (hour >= 6 && hour < 12) {
    return 2;
  }

  if (hour >= 12 && hour < 18) {
    return 2;
  }

  if (hour >= 18 && hour < 24) {
    return 2;
  }
  throw new Error('invalid hour for group');
}
