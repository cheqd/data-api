const BIG_DIPPER_GRAPHQL_URL = "https://explorer-gql.cheqd.io/v1/graphql";

class BigDipperApi {
  constructor(graphql_client) {
    this.graphql_client = graphql_client;
  }

  async get_accounts(addresses) {
    let query = "query Account($addresses: [String], $utc: timestamp) {\n" +
        "  account(where: { address: { _in: $addresses } }) {\n" +
        "    address\n" +
        "    accountBalances: account_balances(limit: 1, order_by: { height: desc }) {\n" +
        "      coins\n" +
        "    }\n" +
        "    delegations {\n" +
        "      amount\n" +
        "    }\n" +
        "    unbonding: unbonding_delegations(\n" +
        "      where: { completion_timestamp: { _gt: $utc } }\n" +
        "    ) {\n" +
        "      amount\n" +
        "    }\n" +
        "    redelegations(where: { completion_time: { _gt: $utc } }) {\n" +
        "      amount\n" +
        "    }\n" +
        "    delegationRewards: delegation_rewards {\n" +
        "      amount\n" +
        "    }\n" +
        "  }\n" +
        "}\n";

    let params = {
      utc: new Date(),
      addresses
    }

    let resp = await this.graphql_client.query(query, params);
    return resp.account;
  }

  async get_total_supply() {
    let query = "query Supply {\n" +
        "  supply(order_by: {height:desc} limit: 1) {\n" +
        "    coins\n" +
        "    height\n" +
        "  }\n" +
        "}\n";

    let resp = await this.graphql_client.query(query, {});
    return resp.supply[0].coins;
  }
}

class GraphQLClient {
  constructor(base_url) {
    this.base_url = base_url;
  }

  async query(query, variables) {
    let req = {
      query,
      variables
    }

    let resp = await fetch(this.base_url, {
      method: "POST",
      body: JSON.stringify(req)
    })

    let resp_json = await resp.json();

    if (resp_json.errors != null) {
      throw resp_json.errors;
    }

    return resp_json.data;
  }
}

function total_balance_ncheq(account) {
  let balance = parseInt(account.accountBalances[0]?.coins.find(c => c.denom === "ncheq")?.amount) || 0;

  let delegations = account.delegations.map(d => d.amount)
      .filter(a => a.denom === "ncheq")
      .map(a => parseInt(a.amount))
      .reduce((a, b) => a + b, 0);

  let unbonding = account.unbonding.map(d => d.amount)
      .filter(a => a.denom === "ncheq")
      .map(a => parseInt(a.amount))
      .reduce((a, b) => a + b, 0);

  let rewards = account.delegationRewards.map(d => d.amount)
      .flat()
      .filter(a => a.denom === "ncheq")
      .map(a => parseInt(a.amount))
      .reduce((a, b) => a + b, 0);

  return balance + delegations + unbonding + rewards;
}

async function get_circulating_supply(non_circulating_addresses) {
  let gql_client = new GraphQLClient(BIG_DIPPER_GRAPHQL_URL);
  let bd_api = new BigDipperApi(gql_client);

  let non_circulating_accounts = await bd_api.get_accounts(non_circulating_addresses);

  // Calculate total balance of watchlist accounts
  let non_circulating_supply_ncheq = non_circulating_accounts.map(a => total_balance_ncheq(a)).reduce((a, b) => a + b, 0);
  
  // Get total supply
  let total_supply = await bd_api.get_total_supply();
  let total_supply_ncheq = total_supply.find(c => c.denom === "ncheq").amount;

  // Calculate circulating supply
  let circulating_supply_ncheq = total_supply_ncheq - non_circulating_supply_ncheq

  return circulating_supply_ncheq;
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  let non_circulating_addresses = JSON.parse(DENY_LIST);
  let circulating_supply = await get_circulating_supply(non_circulating_addresses);

  return new Response(circulating_supply);
}
