// Script that gets information of stakers with legacy Nu or Keep
// It needs variables in .env SUBGRAPH_API_KEY and MAINNET_RPC_URL
// Note: MAINNET_RPC_URL must address to an archive node
// Use: node src/scripts/get_legacy_stakers.js

require("dotenv").config()

const Subgraph = require("./pre-rewards/subgraph.js")

const subgraphApiKey = process.env.SUBGRAPH_API_KEY
const rpcUrl = process.env.MAINNET_RPC_URL

const subgraphId = "8iv4pFv7UL3vMjYeetmFCKD9Mg2V4d1S2rapQXo8fRq5"
const gqlUrl = `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/${subgraphId}`

// Block height in which legacy stakers were disabled
// https://etherscan.io/tx/0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656
const blockNumber = 18624792

async function main() {
  const legacyStakes = await Subgraph.getLegacyStakesInfo(
    gqlUrl,
    rpcUrl,
    blockNumber - 1
  )

  console.log(JSON.stringify(legacyStakes, null, 4))
}

main()
