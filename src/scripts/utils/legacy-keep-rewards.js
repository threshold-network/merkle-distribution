const { getBuiltGraphSDK } = require("../../../.graphclient")
const { BigNumber } = require("bignumber.js")
const { legacyKeepAccounts } = require("./legacy-keep-stakes")

// Timestamp of legacy tokens deactivation. See
// https://etherscan.io/tx/0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656
const DEACT_TIMESTAMP = 1700625971
// Block height in which legacy stakes were deactivated
const DEACT_BLOCK = 18624792
const SECONDS_IN_YEAR = 31536000

//
// For a specific block, return a list of stakes whose tokens were staked in
// Keep staking contracts. These staked tokens were registred as keepInT in the
// Threshold staking contract.
//
async function getLegacyKeepStakes() {
  const stakes = {}

  legacyKeepAccounts.map((account) => {
    account.stakes.map((stake) => {
      if (stake.keepInTStake === "0") {
        return
      }
      let auths = {}
      if (stake.authorizations.length > 0) {
        const tBTCAuth = stake.authorizations.filter(
          (auth) => auth.appName === "tBTC"
        )[0]
        const rBAuth = stake.authorizations.filter(
          (auth) => auth.appName === "Random Beacon"
        )[0]
        auths = { tBTC: tBTCAuth.amount, RandomBeacon: rBAuth.amount }
      }
      stakes[stake.id] = {
        beneficiary: stake.beneficiary,
        keepInTStake: stake.keepInTStake,
        tStake: stake.tStake,
        auths: auths,
      }
    })
  })

  return stakes
}

//
// Given a list of stakes, get those that completed the re-staking (i.e, they
// staked T during the period between legacy staking deactivation and deadline)
//
async function getRestakes(stakes, deadline) {
  const { StakeHistoryBetweenTwoDatesQuery } = getBuiltGraphSDK()

  // Get all the stake history since the legacy deactivation
  const { stakeDatas } = await StakeHistoryBetweenTwoDatesQuery({
    startTimestamp: DEACT_TIMESTAMP + 1,
    endTimestamp: deadline,
  })

  // Get the those provided stakes that did a restake
  const restakes = {}
  stakeDatas.map((stake) => {
    if (stake.stakeHistory.length > 0 && stakes[stake.id]) {
      // For simplicity, we take only the first topped-up event
      restakes[stake.id] = stake.stakeHistory.find(
        (elem) => elem.eventType === "ToppedUp"
      ).stakedAmount
    }
  })

  return restakes
}

//
// Calculate the rewards corresponding to PRE
//
async function getPRERewards(stakes, deadline) {
  const rewards = {}
  const { PREOpsBeforeLegacyDeactQuery } = getBuiltGraphSDK()

  // Get all the operators with PRE confirmed at legacy deactivation time
  const { simplePREApplications } = await PREOpsBeforeLegacyDeactQuery({
    blockNumber: DEACT_BLOCK,
  })

  // Get the legacy stakes that had a PRE operator confirmed
  const stakesWithPre = {}
  Object.keys(stakes).map((stake) => {
    const preOperator = simplePREApplications.filter(
      (operator) => operator.id === stake
    )
    if (preOperator.length !== 0) {
      stakesWithPre[stake] = stakes[stake]
    }
  })

  // Get the stakes that did a re-stake
  const restakes = await getRestakes(stakesWithPre, deadline)

  const stakesToBeRewarded = {}
  Object.keys(stakesWithPre).map((stake) => {
    stakesToBeRewarded[stake] = stakesWithPre[stake].tStake
    if (restakes[stake]) {
      stakesToBeRewarded[stake] = BigNumber(stakesWithPre[stake].tStake)
        .plus(BigNumber(restakes[stake]))
        .toFixed(0)
    }
  })

  // Calculating the rewards
  const rewardsAPR = 15
  const preAllocation = 25
  const conversion_denominator = 100 * 100

  Object.keys(stakesWithPre).map((stake) => {
    const secondsSinceDeact = deadline - DEACT_TIMESTAMP

    const reward = BigNumber(stakesToBeRewarded[stake])
      .times(rewardsAPR)
      .times(preAllocation)
      .times(secondsSinceDeact)
      .div(SECONDS_IN_YEAR * conversion_denominator)

    if (!reward.isZero()) {
      rewards[stake] = reward.toFixed(0)
    }
  })

  return rewards
}

//
// Return the rewards corresponding to Legacy Keep stakes
//
async function getLegacyKeepRewards(deadline) {
  const rewards = {}

  // Get the legacy Keep stakes
  const stakes = await getLegacyKeepStakes()

  // Get the PRE rewards
  const preRewards = await getPRERewards(stakes, deadline)
}

module.exports = {
  getLegacyKeepStakes,
  getLegacyKeepRewards,
}
