const { getBuiltGraphSDK } = require("../../../.graphclient")

//
//For a specific block, return a list of stakes whose tokens were staked in
// Keep staking contracts. These staked tokens were registred as keepInT in the
// Threshold staking contract.
//
async function getLegacyKeepStakes(blockNumber) {
  const { LegacyKeepStakesQuery } = getBuiltGraphSDK()
  const { accounts } = await LegacyKeepStakesQuery({ blockNumber: blockNumber })

  const stakes = {}
  accounts.map((account) => {
    account.stakes.map((stake) => {
      if (stake.keepInTStake === "0") {
        return
      }
      stakes[stake.id] = {
        owner: account.id,
        keepInTStake: stake.keepInTStake,
        tStake: stake.tStake,
      }
    })
  })

  return stakes
}

module.exports = {
  getLegacyKeepStakes,
}
