// addEventListener("fetch", (event) => {
//   event.respondWith(handleRequest(event.request));
// });

// async function handleRequest(request) {
//   const url = parse_url_to_base_class(request.url);
//   const address = url.pathname
//     .replace("/balances/liquid/", "")
//     .replace("/", "");

//   if (!address || !validate_cheqd_address(address))
//     return new Response("No address specified or wrong address format.");

//   return new Response(await calculate_liquid_coins(address));
// }


// async function calculate_liquid_coins(address) {
//   const account = await fetch_account(address)

//   if(!validate_vesting_account( account.account['@type']) ) return `Accounts of type '${account.account['@type']}' are not supported.`

//   const {
//     start_time,
//     end_time,
//     now
//   } = {
//     start_time: new Date(account.account.start_time * 1000),
//     end_time: new Date(account.account.base_vesting_account.end_time * 1000),
//     now: new Date(),
//   }

//   const {
//     time_elapsed_in_days,
//     time_vested_in_days,
//   } = {
//     time_elapsed_in_days: Math.floor( Math.abs( now - start_time ) / ( 1000 * 60 * 60 * 24 ) ),
//     time_vested_in_days: Math.floor( Math.abs( end_time - start_time ) / ( 1000 * 60 * 60 * 24 ) ),
//   }

//   const {
//     ratio
//   } = {
//     ratio: Number(time_elapsed_in_days / time_vested_in_days)
//   }

//   return ratio * Number(account.account.base_vesting_account.original_vesting[0].amount)
// }

// async function fetch_account(address) {
//   return await fetch(
//     `https://api.cheqd.net/cosmos/auth/v1beta1/accounts/${address}`
//   ).then(response => response.json())
// }

// function parse_url_to_base_class(url) {
//   return new URL(url)
// }

// function validate_cheqd_address(address) {
//   return /^(cheqd)1[a-z0-9]{38}$/.test(address)
// }

// function validate_vesting_account(account_type) {
//   return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount'
// }


// cheqd1gzzlq30nwlctxdjg36fmy8djjycs2puvmmnmke <- with delegations
// cheqd1w53yz6ylpraykng3sw6r8lunuar7lteavel3x0 <- vesting
// cheqd1y6ekzultqshf8xwtv46mlzfquj6ys3vmncascq <- ?
// cheqd1yqj0s0htaseqc9prkcsmucme3ef5fsyq5mkqrd
// cheqd13tgpmr4ueuw022l6nxkew823czawc00j56uh9w <- pretty much everything except unbonding


// {"operationName":"Account","variables":{"address":"cheqd1w53yz6ylpraykng3sw6r8lunuar7lteavel3x0","utc":"2022-03-28T15:18:27"},"query":"query Account($address: String, $utc: timestamp) {\n  stakingParams: staking_params(limit: 1) {\n    params\n    __typename\n  }\n  account(where: {address: {_eq: $address}}) {\n    address\n    accountBalances: account_balances(limit: 1, order_by: {height: desc}) {\n      coins\n      __typename\n    }\n    delegations {\n      amount\n      validator {\n        validatorInfo: validator_info {\n          operatorAddress: operator_address\n          __typename\n        }\n        validatorCommissions: validator_commissions(limit: 1, order_by: {height: desc}) {\n          commission\n          __typename\n        }\n        validatorStatuses: validator_statuses(limit: 1, order_by: {height: desc}) {\n          status\n          jailed\n          __typename\n        }\n        validatorSigningInfos: validator_signing_infos(\n          order_by: {height: desc}\n          limit: 1\n        ) {\n          tombstoned\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    unbonding: unbonding_delegations(where: {completion_timestamp: {_gt: $utc}}) {\n      amount\n      completionTimestamp: completion_timestamp\n      validator {\n        validatorCommissions: validator_commissions(limit: 1, order_by: {height: desc}) {\n          commission\n          __typename\n        }\n        validatorInfo: validator_info {\n          operatorAddress: operator_address\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    redelegations(where: {completion_time: {_gt: $utc}}) {\n      amount\n      completionTime: completion_time\n      from: src_validator_address\n      to: dst_validator_address\n      __typename\n    }\n    delegationRewards: delegation_rewards {\n      amount\n      withdrawAddress: withdraw_address\n      validator {\n        validatorInfo: validator_info {\n          operatorAddress: operator_address\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  validator: validator(\n    limit: 1\n    where: {validator_info: {self_delegate_address: {_eq: $address}}}\n  ) {\n    commission: validator_commission_amounts(limit: 1, order_by: {height: desc}) {\n      amount\n      __typename\n    }\n    __typename\n  }\n}\n"}


import fetch from 'node-fetch';

const BIG_DIPPER_GRAPHQL_URL = "https://explorer-gql.cheqd.io/v1/graphql";
const CHEQD_NODE_API_URL = "https://api.cheqd.net";

class BigDipperApi {
    constructor(graphql_client) {
        this.graphql_client = graphql_client;
    }

    // Returns only base (non vesting) accounts
    async get_accounts(address) {
        let query = "query Account($address: String, $utc: timestamp) {\n" +
            "  account(where: { address: { _eq: $address } }) {\n" +
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
            address,
            utc: new Date()
        };

        let resp = await this.graphql_client.query(query, params);
        return resp.account;
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

class CheqdNodeApi {
    constructor(base_url) {
        this.base_url = base_url;
    }

    async get_accounts() {
        let resp = await fetch(this.base_url + "/cosmos/auth/v1beta1/accounts?pagination_limit=2000")
        return (await resp.json()).accounts;
    }
}



async function get_circulating_supply() {
    // let base_accounts_circulating_supply = await get_circulating_supply_of_base_accounts();
    // console.log(`Circulating supply of base accounts: ${base_accounts_circulating_supply}`);

    let vesting_accounts_circulating_supply = await get_circulating_supply_of_vesting_accounts();

    // console.log(bd_accounts);
}

async function get_circulating_supply_of_vesting_accounts() {
    let cheqd_api = new CheqdNodeApi(CHEQD_NODE_API_URL);

    console.log("Getting account list from cheqd REST API...");
    let accounts = await cheqd_api.get_accounts();
    console.log(`Received ${accounts.length} items`);

    // console.log(accounts)

    // let accounts_pretty = accounts.map(prettify_big_dipper_account);
    // return accounts_pretty.map(a => a.balance).reduce((a, b) => a + b, 0);

    return 0;
}

async function get_circulating_supply_of_base_accounts() {
    let client = new GraphQLClient(BIG_DIPPER_GRAPHQL_URL);
    let api = new BigDipperApi(client);

    console.log("Getting account list from BigDipper GraphQL API...");
    let accounts = await api.get_accounts();
    console.log(`Received ${accounts.length} items`);

    let accounts_pretty = accounts.map(prettify_big_dipper_account);
    return accounts_pretty.map(a => a.balance).reduce((a, b) => a + b, 0);
}

function prettify_big_dipper_account(account) {
    return {
        address: account.address,
        balance: parseInt(account.accountBalances[0]?.coins.find(c => c.denom === "ncheq")?.amount) || 0,
    };
}

await  get_circulating_supply()