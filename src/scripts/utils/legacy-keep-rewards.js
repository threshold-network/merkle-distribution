const { getBuiltGraphSDK } = require("../../../.graphclient")
const { BigNumber } = require("bignumber.js")
const { legacyKeepAccounts } = require("./legacy-keep-stakes")
const { getTACoRewards } = require("./taco-rewards")

const SECONDS_IN_YEAR = 31536000
// Deadline for the transition process, as stated in
// https://forum.threshold.network/t/transition-guide-for-legacy-stakers/719
const TRANSITION_DEADLINE = 1708732799 // 2024-02-23T23:59:59
// Timestamp of legacy tokens deactivation. See
// https://etherscan.io/tx/0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656
const LEGACY_DEACT_TIMESTAMP = 1700625971
// Block height in which legacy stakes were deactivated
const LEGACY_DEACT_BLOCK = 18624792
// Timestamp of deactivation of PRE rewards
const PRE_DEACT_TIMESTAMP = 1706745600

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
// staked T during the period between legacy staking deactivation and transition
// deadline)
//
async function getRestakes(stakes) {
  const { StakeHistoryBetweenTwoDatesQuery } = getBuiltGraphSDK()

  // Get all the stake history since the legacy deactivation
  const { stakeDatas } = await StakeHistoryBetweenTwoDatesQuery({
    startTimestamp: LEGACY_DEACT_TIMESTAMP + 1,
    endTimestamp: TRANSITION_DEADLINE,
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
async function getPRERewards(legacyStakes) {
  const rewards = {}
  const { PREOpsBeforeLegacyDeactQuery } = getBuiltGraphSDK()

  // Get all the operators with PRE confirmed at legacy deactivation time
  const { simplePREApplications } = await PREOpsBeforeLegacyDeactQuery({
    blockNumber: LEGACY_DEACT_BLOCK,
  })

  // Get the legacy stakes that had a PRE operator confirmed
  const stakesWithPre = {}
  Object.keys(legacyStakes).map((stake) => {
    const preOperator = simplePREApplications.filter(
      (operator) => operator.id === stake
    )
    if (preOperator.length !== 0) {
      stakesWithPre[stake] = legacyStakes[stake]
    }
  })

  // Get the stakes that did a re-stake
  const restakes = await getRestakes(stakesWithPre)

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
    const secondsSincePREDeact = TRANSITION_DEADLINE - PRE_DEACT_TIMESTAMP

    const reward = BigNumber(stakesToBeRewarded[stake])
      .times(rewardsAPR)
      .times(preAllocation)
      .times(secondsSincePREDeact)
      .div(SECONDS_IN_YEAR * conversion_denominator)

    if (!reward.isZero()) {
      rewards[stake] = reward.toFixed(0)
    }
  })

  return rewards
}

//
// Calculate the rewards corresponding to TACo
//
async function getTACoRewardsForLegacy(legacyStakes) {
  const tACoActivationTime = PRE_DEACT_TIMESTAMP
  const tacoRewards = await getTACoRewards(
    tACoActivationTime,
    TRANSITION_DEADLINE,
    0.25
  )

  const rewards = {}
  Object.keys(tacoRewards).map((stake) => {
    if (legacyStakes[stake]) {
      rewards[stake] = tacoRewards[stake].amount
    }
  })
  return rewards
}

//
// Calculate the rewards corresponding to tBTC
//
async function getTbtcRewards(legacyStakes) {
  const rewards = {}
  const { RBAuthHistoryQuery, TbtcAuthHistoryQuery } = getBuiltGraphSDK()

  // Get all the stakes that have a AuthorizationIncreased event for RB and tBTC
  const { appAuthHistories: rbAuthHistoryResult } = await RBAuthHistoryQuery({
    startTimestamp: LEGACY_DEACT_TIMESTAMP + 1,
    endTimestamp: TRANSITION_DEADLINE,
  })
  const { appAuthHistories: tbtcAuthHistoryResult } =
    await TbtcAuthHistoryQuery({
      startTimestamp: LEGACY_DEACT_TIMESTAMP + 1,
      endTimestamp: TRANSITION_DEADLINE,
    })
  const rbAuthIncreases = {}
  Object.keys(rbAuthHistoryResult).map((elem) => {
    const historyElem = rbAuthHistoryResult[elem]
    if (historyElem.eventType === "AuthorizationIncreased") {
      let timestamp = historyElem.timestamp
      let amount = historyElem.amount
      // for simplicity, if there are multiple authorizationIncreased events,
      // we take the greater amount but the first timestamp
      const prevAuthIncreased =
        rbAuthIncreases[historyElem.appAuthorization.stake.id]
      if (prevAuthIncreased) {
        timestamp =
          timestamp < prevAuthIncreased.timestamp
            ? timestamp
            : prevAuthIncreased.timestamp
        amount =
          amount > prevAuthIncreased.amount ? amount : prevAuthIncreased.amount
      }
      rbAuthIncreases[historyElem.appAuthorization.stake.id] = {
        timestamp: timestamp,
        amount: amount,
      }
    }
  })
  const tbtcAuthIncreases = {}
  Object.keys(tbtcAuthHistoryResult).map((elem) => {
    const historyElem = tbtcAuthHistoryResult[elem]
    if (historyElem.eventType === "AuthorizationIncreased") {
      let timestamp = historyElem.timestamp
      let amount = historyElem.amount
      // for simplicity, if there are multiple authorization increased events,
      // we take the greater amount but the first timestamp
      const prevAuthIncreased =
        tbtcAuthIncreases[historyElem.appAuthorization.stake.id]
      if (prevAuthIncreased) {
        timestamp =
          timestamp < prevAuthIncreased.timestamp
            ? timestamp
            : prevAuthIncreased.timestamp
        amount =
          amount > prevAuthIncreased.amount ? amount : prevAuthIncreased.amount
      }
      tbtcAuthIncreases[historyElem.appAuthorization.stake.id] = {
        timestamp: timestamp,
        amount: amount,
      }
    }
  })

  const reauthorizedStakes = {}
  const noReauthorizedStakes = {}

  // Get which legacy stakes did the reauthorization and which didn't
  Object.keys(legacyStakes).map((stake) => {
    // if reauthorization done...
    if (rbAuthIncreases[stake] && tbtcAuthIncreases[stake]) {
      // the reauthorized amount is the lower between RB and tBTC
      const reauthorizedAmount = BigNumber(rbAuthIncreases[stake].amount).lt(
        BigNumber(tbtcAuthIncreases[stake].amount)
      )
        ? rbAuthIncreases[stake].amount
        : tbtcAuthIncreases[stake].amount

      // the timestamp is the later between RB and tBTC
      const reauthorizedTimestamp =
        Number(rbAuthIncreases[stake].timestamp) >
        Number(tbtcAuthIncreases[stake].timestamp)
          ? rbAuthIncreases[stake].timestamp
          : tbtcAuthIncreases[stake].timestamp

      // we also need the auth history for the period after restaking
      const postRestakeRBAuthHistory = rbAuthHistoryResult.filter(
        (auth) =>
          auth.appAuthorization.stake.id === stake &&
          auth.timestamp > reauthorizedTimestamp
      )
      const postRestakeTbtcAuthHistory = tbtcAuthHistoryResult.filter(
        (auth) =>
          auth.appAuthorization.stake.id === stake &&
          auth.timestamp > reauthorizedTimestamp
      )

      reauthorizedStakes[stake] = {
        reauthorizedAmount: reauthorizedAmount,
        reauthorizedTimestamp: reauthorizedTimestamp,
        postRestakeRBAuthHistory: postRestakeRBAuthHistory,
        postRestakeTbtcAuthHistory: postRestakeTbtcAuthHistory,
      }
      // if no reauthorization done...
    } else {
      let amount = "0"
      if (
        legacyStakes[stake].auths.RandomBeacon &&
        legacyStakes[stake].auths.tBTC
      ) {
        amount = BigNumber(legacyStakes[stake].auths.tBTC).lt(
          BigNumber(legacyStakes[stake].auths.RandomBeacon)
        )
          ? legacyStakes[stake].auths.tBTC
          : legacyStakes[stake].auths.RandomBeacon
      }
      noReauthorizedStakes[stake] = {
        amount: amount,
        beneficiary: legacyStakes[stake].beneficiary,
      }
    }
  })

  // TODO: 2. calculate rewards for those that didn't reauthorized
  // Let's calculate the rewards for those stakes that didn't reauthorized

  // TODO: 3. calculate rewards for those that reauthorized
  return rewards
}

//
// Return the rewards corresponding to Legacy Keep stakes
//
async function getLegacyKeepRewards() {
  const rewards = {}

  // Get the legacy Keep stakes
  const stakes = await getLegacyKeepStakes()

  // Get the PRE rewards
  // const preRewards = await getPRERewards(stakes)

  // Get the TACo rewards
  // const tacoRewards = await getTACoRewardsForLegacy(stakes)

  // Get the tBTC rewards
  const tbtcRewards = await getTbtcRewards(stakes)

  return rewards
}

module.exports = {
  getLegacyKeepStakes,
  getLegacyKeepRewards,
}
