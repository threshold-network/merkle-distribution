// Script that gets information of stakers with legacy Nu or Keep
// It needs variables in .env ETHERSCAN_TOKEN, SUBGRAPH_API_KEY and MAINNET_RPC_URL
// Use: node src/scripts/get_legacy_stakers.js

require("dotenv").config()
const { createClient, gql } = require("@urql/core")
const ethers = require("ethers")

const etherscanApiKey = process.env.ETHERSCAN_TOKEN
const subgraphApiKey = process.env.SUBGRAPH_API_KEY
const rpcUrl = process.env.MAINNET_RPC_URL

const subgraphId = "8iv4pFv7UL3vMjYeetmFCKD9Mg2V4d1S2rapQXo8fRq5"
const gqlUrl = `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/${subgraphId}`

async function getStakers() {
  const legacyStakersQuery = gql`
    query legacyStakersQuery {
      accounts(
        first: 1000
        where: {
          stakes_: { or: [{ keepInTStake_gt: "0" }, { nuInTStake_gt: "0" }] }
        }
      ) {
        id
        stakes {
          id
          keepInTStake
          nuInTStake
          tStake
        }
      }
    }
  `

  const gqlClient = createClient({ url: gqlUrl, maskTypename: true })

  const response = await gqlClient.query(legacyStakersQuery).toPromise()

  if (response.error) {
    console.error(`Error: ${response.error.message}`)
    return
  }

  if (!response.data || response.data["accounts"].length === 0) {
    console.error("No data found")
    return
  }

  const stakers = response.data["accounts"]

  return stakers
}

async function getStakerAuthorizations(stakingProvider) {
  const tokenStakingAddress = "0x409bf77A8E3Fe384497227eA508029B5364933DE"
  const tokenStakingProxyAddress = "0x01B67b1194C75264d06F808A921228a95C765dd7"
  const walletRegistryAddress = "0x46d52E41C2F300BC82217Ce22b920c34995204eb"
  const randomBeaconAddress = "0x5499f54b4A1CB4816eefCf78962040461be3D80b"

  const fetchResponse = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${tokenStakingAddress}&apikey=${etherscanApiKey}`
  )
  const fetchResponseJson = await fetchResponse.json()
  const tokenStakingAbi = fetchResponseJson.result

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

  const tokenStakingContract = new ethers.Contract(
    tokenStakingProxyAddress,
    tokenStakingAbi,
    provider
  )

  const walletRegistryAuthorization =
    await tokenStakingContract.authorizedStake(
      stakingProvider,
      walletRegistryAddress
    )
  const RandomBeaconAuthorization = await tokenStakingContract.authorizedStake(
    stakingProvider,
    randomBeaconAddress
  )

  const authorizations = {
    WalletRegistry: walletRegistryAuthorization.toString(),
    RandomBeacon: RandomBeaconAuthorization.toString(),
  }

  return authorizations
}

async function main() {
  const stakers = await getStakers()
  if (!stakers) {
    return
  }

  for (let i = 0; i < stakers.length; i++) {
    stakers[i].owner = stakers[i].id
    delete stakers[i].id

    const stakes = stakers[i].stakes.filter(
      (stake) => stake.keepInTStake !== "0" || stake.nuInTStake !== "0"
    )

    for (let stakeIndex = 0; stakeIndex < stakes.length; stakeIndex++) {
      stakes[stakeIndex].authorizations = await getStakerAuthorizations(
        stakes[stakeIndex].id
      )
    }

    delete stakers[i].stakes
    stakers[i].stakes = stakes
  }

  console.log(JSON.stringify(stakers, null, 2))
}

main()
