const { gql } = require("@urql/core")

//
//For a specific block, return a list of stakes whose tokens were staked in
// Keep staking contracts. These staked tokens were registred as keepInT in the
// Threshold staking contract.
//
async function getLegacyKeepStakes(gqlClient, blockNumber) {
  const legacyKeepStakersQuery = gql`
    query legacyKeepStakersQuery($blockNumber: Int) {
      accounts(
        first: 1000
        block: { number: $blockNumber }
        where: { stakes_: { keepInTStake_gt: "0" } }
      ) {
        id
        stakes {
          id
          keepInTStake
          nuInTStake
          tStake
          totalStaked
        }
      }
    }
  `

  const response = await gqlClient
    .query(legacyKeepStakersQuery, { blockNumber: blockNumber })
    .toPromise()

  if (response.error) {
    console.error(`Error in getLegacyKeepStakes: ${response.error.message}`)
    return null
  }

  if (!response.data) {
    console.error("No data found")
    return null
  }

  const accounts = response.data["accounts"]

  const stakes = {}
  accounts.map((account) => {
    account.stakes.map((stake) => {
      if (stake.keepInTStake === "0" && stake.nuInTStake === "0") {
        return
      }
      stakes[stake.id] = {
        owner: account.id,
        keepInTStake: stake.keepInTStake,
        nuInTStake: stake.nuInTStake,
        tStake: stake.tStake,
      }
    })
  })

  return stakes
}

module.exports = {
  getLegacyKeepStakes,
}
