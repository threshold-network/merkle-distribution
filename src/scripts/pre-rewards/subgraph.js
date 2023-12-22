require("isomorphic-unfetch")
const { createClient, gql } = require("@urql/core")
const { ethers } = require("ethers")
const BigNumber = require("bignumber.js")

// The Graph limits GraphQL queries to 1000 results max
const RESULTS_PER_QUERY = 1000

async function getEpochById(gqlClient, epochId) {
  let epoch
  let lastId = ""
  let epochStakes = []
  let data = []

  const FIRST_EPOCH_QUERY = gql`
    query FirstEpoch($id: String) {
      epoch(id: $id) {
        id
        timestamp
        duration
        totalAmount
      }
    }
  `

  const EPOCH_STAKES_QUERY = gql`
    query EpochStakes(
      $epochIds: [String!]
      $resultsPerQuery: Int
      $lastId: String
    ) {
      epochStakes(
        first: $resultsPerQuery
        where: { epoch_in: $epochIds, id_gt: $lastId }
      ) {
        id
        owner
        stakingProvider
        amount
        epoch {
          id
        }
      }
    }
  `

  await gqlClient
    .query(FIRST_EPOCH_QUERY, { id: epochId.toString() })
    .toPromise()
    .then((result) => {
      if (result.error) console.error(result.error)
      epoch = result.data.epoch
    })

  const epochIds = [epoch.id]

  do {
    await gqlClient
      .query(EPOCH_STAKES_QUERY, {
        epochIds: epochIds,
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()
      .then((result) => {
        if (result.error) console.error(result.error)
        data = result.data?.epochStakes
        if (data.length > 0) {
          epochStakes = epochStakes.concat(data)
          lastId = data[data.length - 1].id
        }
      })
  } while (data.length > 0)

  epoch.stakes = epochStakes

  return epoch
}

async function getEpochsBetweenDates(gqlClient, startTimestamp, endTimestamp) {
  let lastTimestamp = startTimestamp - 1
  let lastId = ""
  let epochs = []
  let epochStakes = []
  let data = []

  const EPOCHS_QUERY = gql`
    query Epochs(
      $lastTimestamp: String
      $endTimestamp: String
      $resultsPerQuery: Int
    ) {
      epoches(
        first: $resultsPerQuery
        orderBy: timestamp
        where: { timestamp_gt: $lastTimestamp, timestamp_lte: $endTimestamp }
      ) {
        id
        timestamp
        duration
        totalAmount
      }
    }
  `

  const EPOCH_STAKES_QUERY = gql`
    query EpochStakes(
      $epochIds: [String!]
      $resultsPerQuery: Int
      $lastId: String
    ) {
      epochStakes(
        first: $resultsPerQuery
        where: { epoch_in: $epochIds, id_gt: $lastId }
      ) {
        id
        owner
        stakingProvider
        amount
        epoch {
          id
        }
      }
    }
  `

  do {
    await gqlClient
      .query(EPOCHS_QUERY, {
        lastTimestamp: lastTimestamp.toString(),
        endTimestamp: endTimestamp.toString(),
        resultsPerQuery: RESULTS_PER_QUERY,
      })
      .toPromise()
      .then((result) => {
        if (result.error) console.error(result.error)
        data = result.data?.epoches
        if (data.length > 0) {
          epochs = epochs.concat(data)
          lastTimestamp = data[data.length - 1].timestamp
        }
      })
  } while (data.length > 0)

  const epochIds = epochs.map((epoch) => epoch.id)

  do {
    await gqlClient
      .query(EPOCH_STAKES_QUERY, {
        epochIds: epochIds,
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()
      .then((result) => {
        if (result.error) console.error(result.error)
        data = result.data?.epochStakes
        if (data.length > 0) {
          epochStakes = epochStakes.concat(data)
          lastId = data[data.length - 1].id
        }
      })
  } while (data.length > 0)

  epochs.forEach((epoch) => (epoch.stakes = []))
  epochStakes.forEach((epochStake) => {
    const i = epochIds.findIndex((epochId) => epochId === epochStake.epoch.id)
    epochs[i].stakes.push(epochStake)
  })

  return epochs
}

async function getOperatorsConfirmedBeforeDate(gqlClient, timestamp) {
  let lastId = ""
  let operators = []
  let data = []

  const OPS_CONF_BETWEEN_DATES = gql`
    query SimplePREApplications(
      $timestamp: String
      $resultsPerQuery: Int
      $lastId: String
    ) {
      simplePREApplications(
        first: $resultsPerQuery
        where: { confirmedTimestamp_lte: $timestamp, id_gt: $lastId }
      ) {
        bondedTimestamp
        confirmedTimestamp
        id
        operator
      }
    }
  `

  do {
    await gqlClient
      .query(OPS_CONF_BETWEEN_DATES, {
        timestamp: timestamp.toString(),
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()
      .then((result) => {
        if (result.error) console.error(result.error)
        data = result.data?.simplePREApplications
        if (data.length > 0) {
          operators = operators.concat(data)
          lastId = data[data.length - 1].id
        }
      })
  } while (data.length > 0)

  return operators
}

async function getStakeDatasInfo(gqlClient) {
  let lastId = ""
  let stakeDatas = []
  let data = []

  const STAKES_DATA_INFO = gql`
    query stakeDatasInfo($resultsPerQuery: Int, $lastId: String) {
      stakeDatas(first: $resultsPerQuery, where: { id_gt: $lastId }) {
        beneficiary
        id
        authorizer
        owner {
          id
        }
      }
    }
  `

  do {
    await gqlClient
      .query(STAKES_DATA_INFO, {
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()
      .then((result) => {
        if (result.error) console.error(result.error)
        data = result.data?.stakeDatas
        if (data.length > 0) {
          stakeDatas = stakeDatas.concat(data)
          lastId = data[data.length - 1].id
        }
      })
  } while (data.length > 0)

  return stakeDatas
}

/**
 * Return the PRE-rewards-elegible stakes, including beneficiary and epoch
 * stakes between two dates. Stakes earn rewards during the period in which:
 * 1. Have any amount of T token staked
 * 2. Have an PRE node deployed and confirmed in Threshold Network
 * @param {string}  gqlURL          Subgraph GraphQL API URL
 * @param {Number} startTimestamp   Start date UNIX timestamp
 * @param {Number} endTimestamp     End date UNIX timestamp
 * @returns {Promise}               Promise of an object
 *          {Object[]}              preStakes - The PRE-elegible stakes
 *          {string}                preStakes[].beneficiary - Beneficiary addr
 *          {Object[]}              preStakes[].epochStakes - Epoch stakes
 */
exports.getPreStakes = async function (gqlUrl, startTimestamp, endTimestamp) {
  const currentTime = parseInt(Date.now() / 1000)
  const gqlClient = createClient({ url: gqlUrl })

  // Get the list of operators confirmed between dates
  const opsConfirmed = await getOperatorsConfirmedBeforeDate(
    gqlClient,
    endTimestamp
  )

  // Get the stakes information
  const stakeDatas = await getStakeDatasInfo(gqlClient)

  let epochs = await getEpochsBetweenDates(
    gqlClient,
    startTimestamp,
    endTimestamp
  )
  const firstEpochId = parseInt(epochs[0].id) > 0 ? epochs[0].id - 1 : 0
  let firstEpoch = await getEpochById(gqlClient, firstEpochId)

  epochs = [firstEpoch, ...epochs]
  epochs[0].timestamp = startTimestamp.toString()
  epochs[0].duration = (epochs[1].timestamp - startTimestamp).toString()
  const lastEpochIndex = epochs.length - 1 > 0 ? epochs.length - 1 : 0
  epochs[lastEpochIndex].duration = (
    endTimestamp - epochs[lastEpochIndex].timestamp
  ).toString()

  // Clean the empty epochs
  epochs = epochs.filter((epoch) => {
    return epoch.stakes.length > 0 && epoch.duration !== "0"
  })

  // Sort the epoch's stakes by staking provider
  const stakeList = {}
  epochs.forEach((epoch) => {
    epoch.stakes.forEach((epochStake) => {
      const stakeData = {}
      stakeData.epochTotalAmount = epoch.totalAmount
      stakeData.epochDuration = epoch.duration
      stakeData.epochTimestamp = epoch.timestamp
      stakeData.amount = epochStake.amount
      stakeData.epochId = epoch.id
      stakeList[epochStake.stakingProvider] = stakeList[
        epochStake.stakingProvider
      ]
        ? stakeList[epochStake.stakingProvider]
        : []
      stakeList[epochStake.stakingProvider].push(stakeData)
    })
  })

  const preStakes = {}

  // Calculate the actual epoch stake duration: the seconds in which the stake
  // actually meets with operator confirmed PRE reward requirement
  Object.keys(stakeList).map((stakingProvider) => {
    let epochStakes = stakeList[stakingProvider]

    // Check if operator is confirmed and when
    const opConf = opsConfirmed.find((op) => op.id === stakingProvider)
    const opConfTimestamp = opConf ? opConf.confirmedTimestamp : undefined
    if (opConfTimestamp) {
      // Discard the stake epochs in which operator was not confirmed yet and
      // reduce the duration of those epochs in which operator was confirmed
      const epochStakesClean = epochStakes.map((epochStake) => {
        const epochTimestamp = parseInt(epochStake.epochTimestamp)
        let epochDuration = epochStake.epochDuration
          ? parseInt(epochStake.epochDuration)
          : currentTime - epochStake.epochTimestamp

        if (
          // If the operator was confirmed in the middle of this epoch the,
          // the duration is shorter
          opConfTimestamp > epochTimestamp &&
          opConfTimestamp <= epochTimestamp + epochDuration
        ) {
          epochDuration = epochTimestamp + epochDuration - opConfTimestamp
        } else if (opConfTimestamp >= epochTimestamp + epochDuration) {
          // No duration if the operator was not yet confirmed
          epochDuration = 0
        }

        return {
          epochId: epochStake.epochId,
          amount: epochStake.amount,
          epochDuration: epochDuration,
        }
      })

      const stakeDatasItem = stakeDatas.find(
        (stakeData) => stakeData.id === stakingProvider
      )

      const benefCheckSum = ethers.utils.getAddress(stakeDatasItem.beneficiary)

      const stProvCheckSum = ethers.utils.getAddress(stakingProvider)

      preStakes[stProvCheckSum] = {
        beneficiary: benefCheckSum,
        epochStakes: epochStakesClean,
      }
    }
  })

  return preStakes
}

/**
 * Return the bonus-elegible stakes, including beneficiary and staked amount.
 * Only stakes that meet with the following requirements are elegible for bonus
 * reward:
 * 1. Start staking before Jun 1st 2022 00:00:00 GMT
 * 2. Not to unstake any amount of T before Jul 15th 2022 00:00:00 GMT
 * 3. Have an PRE node deployed and confirmed in Threshold Network
 * @param {string} gqlURL     Subgraph GraphQL API URL
 * @returns {Promise}         Promise of an object
 *          {Object[]}        bonusStakes - The bonus-elegible stakes
 *          {string}          bonusStakes[].beneficiary - Beneficiary address
 *          {string}          bonusStakes[].amount - Bonus reward amount
 */
exports.getBonusStakes = async function (gqlUrl) {
  const startTimestamp = 1654041600 // Jun 1st 2022 00:00:00 GMT
  const endTimestamp = 1657843200 // Jul 15th 2022 00:00:00 GMT
  const gqlClient = createClient({ url: gqlUrl })

  // Get the list of operators confirmed between dates
  const opsConfirmed = await getOperatorsConfirmedBeforeDate(
    gqlClient,
    startTimestamp
  )

  // Get the stakes information
  const stakeDatas = await getStakeDatasInfo(gqlClient)

  let epochs = await getEpochsBetweenDates(
    gqlClient,
    startTimestamp,
    endTimestamp
  )

  const firstEpochId = parseInt(epochs[0].id) > 0 ? epochs[0].id - 1 : 0
  let firstEpoch = await getEpochById(gqlClient, firstEpochId)
  epochs = [firstEpoch, ...epochs]

  // Sort the epoch's stakes by staking provider
  const stakeList = {}
  epochs.forEach((epoch) => {
    epoch.stakes.forEach((epochStake) => {
      const stakeData = {}
      stakeData.amount = BigNumber(epochStake.amount)
      stakeData.epochId = Number(epoch.id)
      stakeData.epochTimestamp = Number(epoch.timestamp)
      stakeList[epochStake.stakingProvider] = stakeList[
        epochStake.stakingProvider
      ]
        ? stakeList[epochStake.stakingProvider]
        : []
      stakeList[epochStake.stakingProvider].push(stakeData)
    })
  })

  const bonusStakes = {}

  // Filter the stakes that are not elegible for bonus
  Object.keys(stakeList).map((stakingProvider) => {
    const epochStakes = stakeList[stakingProvider]
    epochStakes.sort((a, b) => a.epochId - b.epochId)

    // stake must have started before the start date
    let elegible = epochStakes[0].epochTimestamp <= startTimestamp
    // stake must have confirmed operator before startDate
    const opConf = opsConfirmed.find((op) => op.id === stakingProvider)
    const opConfTimestamp = opConf
      ? Number(opConf.confirmedTimestamp)
      : undefined
    elegible = elegible && opConfTimestamp <= startTimestamp
    // stake must not have unstaked tokens
    epochStakes.reduce((acc, cur) => {
      if (elegible && cur.amount.gte(acc)) {
        return cur.amount
      } else {
        elegible = false
      }
    }, BigNumber(0))

    if (elegible) {
      // Find the beneficiary of this reward
      const stakeDatasItem = stakeDatas.find(
        (stake) => stake.id === stakingProvider
      )
      const beneficiary = stakeDatasItem.beneficiary

      const stProvCheckSum = ethers.utils.getAddress(stakingProvider)
      bonusStakes[stProvCheckSum] = {
        beneficiary: ethers.utils.getAddress(beneficiary),
        amount: epochStakes[0].amount.toFixed(0),
      }
    }
  })

  return bonusStakes
}

/**
 * Retrieve the information of a particular staker, including the staking history.
 * @param {string}  gqlURL            Subgraph's GraphQL API URL
 * @param {string}  stakingProvider   Staking provider address
 * @return {Object}                   The stake's data
 */
exports.getStakingInfo = async function (gqlUrl, stakingProvider) {
  let stakeData = {
    data: {},
    stake: {},
    operator: {},
    stakingHistory: [],
  }

  const gqlClient = createClient({ url: gqlUrl })

  const STAKE_DATA_QUERY = gql`
    query StakeData($stakingProvider: String) {
      stakeData(id: $stakingProvider) {
        id
        totalStaked
        authorizer
        beneficiary
        keepInTStake
        nuInTStake
        tStake
        owner {
          id
        }
      }
    }
  `

  const OPERATOR_QUERY = gql`
    query Operator($stakingProvider: String) {
      simplePREApplication(id: $stakingProvider) {
        operator
        bondedTimestamp
        confirmedTimestamp
      }
    }
  `

  await gqlClient
    .query(STAKE_DATA_QUERY, {
      stakingProvider: stakingProvider.toLowerCase(),
    })
    .toPromise()
    .then((result) => {
      if (result.error) console.error(result.error)
      const data = result.data.stakeData
      stakeData.data.stakingProvider = data.id
      stakeData.data.owner = data.owner.id
      stakeData.data.beneficiary = data.beneficiary
      stakeData.data.authorizer = data.authorizer
      stakeData.stake.totalStaked = parseInt(data.totalStaked / 10 ** 18)
      stakeData.stake.tStake = parseInt(data.tStake / 10 ** 18)
      stakeData.stake.nuInTStake = parseInt(data.nuInTStake / 10 ** 18)
      stakeData.stake.keepInTStake = parseInt(data.keepInTStake / 10 ** 18)
    })

  await gqlClient
    .query(OPERATOR_QUERY, {
      stakingProvider: stakingProvider.toLowerCase(),
    })
    .toPromise()
    .then((result) => {
      if (result.error) console.error(result.error)
      const data = result.data.simplePREApplication
      if (!data) {
        stakeData.operator = null
      } else {
        stakeData.operator.operator = data.operator
        stakeData.operator.bondedDate = new Date(
          data.bondedTimestamp * 1000
        ).toISOString()
        stakeData.operator.confirmedDate = new Date(
          data.confirmedTimestamp * 1000
        ).toISOString()
      }
    })

  stakeData.stakingHistory = await this.getStakingHistory(
    gqlUrl,
    stakingProvider,
    0
  )

  return stakeData
}

/**
 * Retrieve the history of a list of stakes since a specific block
 * @param {string}  gqlUrl            Subgraph's GraphQL API URL
 * @param {string}  stakingProvider   Staking providers address
 * @param {Number}  [startTimestamp]  Will show only events after this time
 * @param {Number}  [endTimestamp]    Will show only events before this time
 * @return {Object}                   The stake's data
 */
exports.getStakingHistory = async function (
  gqlUrl,
  stakingProvider,
  startTimestamp,
  endTimestamp
) {
  if (!ethers.utils.isAddress(stakingProvider)) {
    console.error("Error: Invalid Staking Provider address")
    return
  }

  const startTime = startTimestamp ? startTimestamp : 0
  const endTime = endTimestamp ? endTimestamp : Math.floor(Date.now() / 1000)

  let lastId = ""
  let recvEpochStakes = []
  let epochStakes = []

  const gqlClient = createClient({ url: gqlUrl })

  const EPOCH_STAKES_QUERY = gql`
    query EpochStakes(
      $stakingProvider: String
      $resultsPerQuery: Int
      $lastId: String
    ) {
      epochStakes(
        first: $resultsPerQuery
        where: { stakingProvider: $stakingProvider, id_gt: $lastId }
      ) {
        id
        amount
        epoch {
          id
          timestamp
        }
      }
    }
  `

  do {
    const response = await gqlClient
      .query(EPOCH_STAKES_QUERY, {
        stakingProvider: stakingProvider.toLowerCase(),
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()

    if (response.error) {
      console.error(`Error getting epoch stakes:\n${response.error.message}`)
      return null
    }

    if (!response.data) {
      console.error("GraphQL client didn't return data")
      return null
    }

    recvEpochStakes = response.data.epochStakes

    if (recvEpochStakes.length > 0) {
      epochStakes = epochStakes.concat(recvEpochStakes)
      lastId = recvEpochStakes[recvEpochStakes.length - 1].id
    }
  } while (recvEpochStakes.length > 0)

  epochStakes = epochStakes.sort((epochA, epochB) => {
    return parseInt(epochA.epoch.id) - parseInt(epochB.epoch.id)
  })

  let stakedAmount = BigNumber(0)
  let stakingHistory = epochStakes.map((epoch, index) => {
    const epochAmount = BigNumber(epoch.amount)

    if (epochAmount.eq(stakedAmount)) {
      return null
    }

    const historyElement = { epoch: epoch.epoch.id }
    if (index === 0) {
      historyElement.event = "staked"
    } else {
      historyElement.event = epochAmount.gt(stakedAmount)
        ? "topped-up"
        : "unstaked"
    }
    historyElement.prevAmountStaked = stakedAmount.toFixed()
    historyElement.currAmountStaked = epochAmount.toFixed()
    historyElement.timestamp = new Date(
      epoch.epoch.timestamp * 1000
    ).toISOString()
    historyElement.unixTimestamp = epoch.epoch.timestamp
    stakedAmount = epochAmount

    return historyElement
  })

  stakingHistory = stakingHistory.filter(
    (historyElement) => historyElement !== null
  )

  stakingHistory = stakingHistory.filter(
    (historyElement) =>
      parseInt(historyElement.unixTimestamp) > startTime &&
      parseInt(historyElement.unixTimestamp) <= endTime
  )

  return stakingHistory
}

/**
 * Return the rewards of those legacy Nu stakes that completed the transition,
 * i.e they restaked the nuInT amount.
 * See https://forum.threshold.network/t/transition-guide-for-legacy-stakers/719
 * @param {string} gqlUrl       Subgraph's GraphQL API URL
 * @returns {Object[]}          Stakes rewards
 */
exports.getLegacyNuRewards = async function (gqlUrl) {
  const deactivationBlock = 18624792
  const deactivationTimestamp = 1700625971 // Nov 22nd 2023 04:06:11
  const dec1Timestamp = 1701388800 // Dec 1st 2023 00:00 UTC
  const legacyNuDeadlineTimestamp = 1701993600 // Dec 8th 2023 00:00 UTC
  const secondsInYear = 31536000

  // Get the legacy Nu stakes
  const legacyNuStakesQuery = gql`
    query legacyNuStakesQuery($blockNumber: Int) {
      accounts(
        first: 1000
        block: { number: $blockNumber }
        where: { stakes_: { nuInTStake_gt: "0" } }
      ) {
        id
        stakes {
          id
          nuInTStake
          tStake
        }
      }
    }
  `

  const gqlClient = createClient({ url: gqlUrl, maskTypename: true })

  const response = await gqlClient
    .query(legacyNuStakesQuery, { blockNumber: deactivationBlock - 1 })
    .toPromise()

  if (response.error) {
    console.error(`Error in getLegacyNuRewards: ${response.error.message}`)
    return null
  }

  if (!response.data) {
    console.error("getLegacyNuRewards: No data found")
    return null
  }

  const accounts = response.data["accounts"]

  // Filter the stakes and reformat them
  let stakes = {}
  accounts.map((account) => {
    account.stakes.map((stake) => {
      if (stake.nuInTStake === "0") {
        return
      }
      stakes[stake.id] = {
        owner: account.id,
        nuInTStake: stake.nuInTStake,
        tStake: stake.tStake,
      }
    })
  })

  const stakesWithHistory = {}
  const stakesHistoryPromises = []
  Object.keys(stakes).map((stake) => {
    const promise = this.getStakingHistory(
      gqlUrl,
      stake,
      deactivationTimestamp,
      legacyNuDeadlineTimestamp
    ).then((history) => {
      stakesWithHistory[stake] = {
        owner: stakes[stake].owner,
        nuInTStake: stakes[stake].nuInTStake,
        tStake: stakes[stake].tStake,
        history: history,
      }
    })
    stakesHistoryPromises.push(promise)
  })
  await Promise.all(stakesHistoryPromises)

  stakes = stakesWithHistory

  // noTransitionTStakes are those stakes that had tStake before the
  // deactivation and that didn't complete the transition. These won't receive
  // nuInT rewards, but they will receive rewards for tStake during Nov 22 to
  // Dec 1 period.
  const noTransitionTStakes = {}

  // Filter stakes that had topped-up events in the transition period
  Object.keys(stakes).map((stake) => {
    stakes[stake].history = stakes[stake].history.filter(
      (event) => event.event === "topped-up"
    )
    if (stakes[stake].history.length === 0) {
      if (stakes[stake].tStake !== "0") {
        noTransitionTStakes[stake] = stakes[stake]
      }
      delete stakes[stake]
    }
  })

  // Calculate how much rewards each stake earned for the period between
  // deactivation (Nov 22nd) and the moment of the restake.
  const rewards = {}
  Object.keys(stakes).map((stake) => {
    const nuInTStaked = BigNumber(stakes[stake].nuInTStake)
    const lastEventIndex = stakes[stake].history.length - 1
    const prevAmount = BigNumber(stakes[stake].history[0].prevAmountStaked)

    const lastAmount = BigNumber(
      stakes[stake].history[lastEventIndex].currAmountStaked
    )

    // The moment in which restake was made. We are considering that few top-up
    // events were emitted and that time between them is not significant
    const restakeTimestamp = parseInt(
      stakes[stake].history[lastEventIndex].unixTimestamp
    )

    const tIncreased = lastAmount.minus(prevAmount)

    // nuInT rewards calculation
    const nuInTRestaked = tIncreased.gt(nuInTStaked) ? nuInTStaked : tIncreased
    const nuInTDuration = restakeTimestamp - deactivationTimestamp
    let nuInTReward = nuInTRestaked
      .times(15)
      .times(nuInTDuration)
      .div(secondsInYear * 100)
    // Reward allocation for PRE at this moment: 25%

    // Rewards leftovers: amount which wasn't distributed in Dec 1st
    let tStakeReward = BigNumber(0)
    let tRestakeReward = BigNumber(0)
    if (restakeTimestamp < dec1Timestamp) {
      // tStake: t staked amount before restaking event
      const tStakeDuration = restakeTimestamp - deactivationTimestamp
      const tStake = BigNumber(stakes[stake].tStake)
      tStakeReward = tStake
        .times(15)
        .times(tStakeDuration)
        .div(secondsInYear * 100)

      // tStake: t staked amount after restaking event
      const tRestakeDuration = dec1Timestamp - restakeTimestamp
      const tRestake = BigNumber(stakes[stake].tStake).plus(tIncreased)
      tRestakeReward = tRestake
        .times(15)
        .times(tRestakeDuration)
        .div(secondsInYear * 100)
    }

    const totalRewards = nuInTReward.plus(tStakeReward).plus(tRestakeReward)
    // Reward allocation for PRE at this moment: 25%
    rewards[stake] = totalRewards.times(0.25).toFixed(0)
  })

  // Calculate the Rewards of T stakes that didn't do the transition.
  // The rewards for the period Nov 22 to Dec 1 wasn't distributed
  Object.keys(noTransitionTStakes).map((stake) => {
    const tStake = BigNumber(noTransitionTStakes[stake].tStake)
    const duration = dec1Timestamp - deactivationTimestamp
    const reward = tStake
      .times(15)
      .times(duration)
      .div(secondsInYear * 100)
    rewards[stake] = reward.times(0.25).toFixed(0)
  })

  return rewards
}

/**
 * For a specific block, return a list of stakes whose tokens were staked in Nu
 * or Keep staking contracts. These staked tokens were registred as nuInT and
 * keepInT in the Threshold staking contract.
 * @param {string} gqlUrl       Subgraph's GraphQL API URL
 * @param {number} blockNumber  Block at which legacy stakes were deactivated
 * @returns {Object[]}          Stakes info
 */
exports.getLegacyStakes = async function (gqlUrl, blockNumber) {
  const legacyStakersQuery = gql`
    query legacyStakersQuery($blockNumber: Int) {
      accounts(
        first: 1000
        block: { number: $blockNumber }
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
          totalStaked
        }
      }
    }
  `

  const gqlClient = createClient({ url: gqlUrl, maskTypename: true })

  const response = await gqlClient
    .query(legacyStakersQuery, { blockNumber: blockNumber })
    .toPromise()

  if (response.error) {
    console.error(`Error in getLegacyStakes: ${response.error.message}`)
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
