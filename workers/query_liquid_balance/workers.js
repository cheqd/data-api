addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const url = parse_url_to_base_class(request.url)
    const address = url.pathname.replace('/balances/liquid/','').replace('/','')
  
    if(!address || !validate_cheqd_address(address)) return new Response("No address specified or wrong address format.")
  
    return new Response( await calculate_liquid_coins( address ) )
  }
  
  async function calculate_liquid_coins(address) {
    const account = await fetch_account(address)
  
    if(!validate_vesting_account( account.account['@type']) ) return `Accounts of type '${account.account['@type']}' are not supported.`
  
    const {
      start_time,
      end_time,
      now
    } = {
      start_time: new Date(account.account.start_time * 1000),
      end_time: new Date(account.account.base_vesting_account.end_time * 1000),
      now: new Date(),
    }
  
    const {
      time_elapsed_in_days,
      time_vested_in_days,
    } = {
      time_elapsed_in_days: Math.floor( Math.abs( now - start_time ) / ( 1000 * 60 * 60 * 24 ) ),
      time_vested_in_days: Math.floor( Math.abs( end_time - start_time ) / ( 1000 * 60 * 60 * 24 ) ),
    }
  
    const {
      ratio
    } = {
      ratio: Number(time_elapsed_in_days / time_vested_in_days)
    }
  
    return ratio * Number(account.account.base_vesting_account.original_vesting[0].amount)
  }
  
  async function fetch_account(address) {
    return await fetch(
      `https://api.cheqd.net/cosmos/auth/v1beta1/accounts/${address}`
    ).then(response => response.json())
  }
  
  function parse_url_to_base_class(url) {
    return new URL(url)
  }
  
  function validate_cheqd_address(address) {
    return /^(cheqd)1[a-z0-9]{38}$/.test(address)
  }
  
  function validate_vesting_account(account_type) {
    return account_type === '/cosmos.vesting.v1beta1.ContinuousVestingAccount'
  }