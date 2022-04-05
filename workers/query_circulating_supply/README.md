# Circulating supply query worker

The worker returns circulating supply of the network.

Circulating supply is calculated as `total_supply` - balances of accounts from `DENY_LIST`.

BigDipper's GraphQL API is used to pull `total supply` and account balances.

## Environment variables

* `DENY_LIST` - a list of addresses. Balances of that addresses will be subtracted from total supply. Format:

    ```
    ["cheqd13wvtjk3v5g4q7pema74nv9lrarr8e6vlx93zat",
    "cheqd1vxfyppcnu6lz72mdc706mlv7kx8434jaknhgt6",
    "cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr"]
    ```

## Assumptions

* Delayed versing accounts that wasn't unlocked are not counted because BigDipper returns `0` total balance for them.
