addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const url = parse_url_to_base_class(request.url)
    const address = url.pathname.replace('/balances/total/','').replace('/','')
  
    if(!address || !validate_cheqd_address(address)) return new Response("No address specified or wrong address format.")
  
    return new Response( ( await fetch_total_balance(address) )['data']['balance']['total'] )
  }
  
  async function fetch_total_balance(address) {
    return await fetch(
      `https://api.cheqd.aneka.io/accounts/${address}`
    ).then(response => response.json())
  }
  
  function parse_url_to_base_class(url) {
    return new URL(url)
  }
  
  function validate_cheqd_address(address) {
      return /^(cheqd)1[a-z0-9]{38}$/.test(address)
  }