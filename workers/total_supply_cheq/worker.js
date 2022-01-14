addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const response = await fetch(
    `https://api.cheqd.net/cosmos/bank/v1beta1/supply/ncheq`
    ).then(response => response.json())
    return new Response(Number(response.amount.amount) * (10 ** -9))
}