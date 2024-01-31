const { gql } = require("@urql/core")
const { BigNumber } = require("bignumber.js")
const { ethers } = require("ethers")

// The Graph limits GraphQL queries to 1000 results max
const RESULTS_PER_QUERY = 1000
const SECONDS_IN_YEAR = 31536000

// Return the history of TACo authorization changes until a given timestamp
// The graphqlClient passed must be for Ethereum mainnet staking subgraph
async function getTACoAuthHistoryUntil(graphqlClient, endTimestamp) {
  const authHistoryQuery = gql`
    query authHistoryQuery(
      $endTimestamp: Int
      $resultsPerQuery: Int
      $lastId: String
    ) {
      appAuthHistories(
        first: $resultsPerQuery
        where: {
          timestamp_lte: $endTimestamp
          appAuthorization_: { appName: "TACo" }
          id_gt: $lastId
        }
      ) {
        id
        timestamp
        amount
        blockNumber
        eventType
        appAuthorization {
          stake {
            id
            beneficiary
          }
        }
      }
    }
  `

  let lastId = ""
  let rawHistory = []
  let data
  do {
    const queryResult = await graphqlClient
      .query(authHistoryQuery, {
        endTimestamp: endTimestamp,
        resultsPerQuery: RESULTS_PER_QUERY,
        lastId: lastId,
      })
      .toPromise()

    if (queryResult.error) {
      console.error(
        "ERROR: No TACo Auth history retrieved\n" + queryResult.error
      )
      return []
    }

    data = queryResult.data.appAuthHistories
    if (data.length > 0) {
      rawHistory = rawHistory.concat(queryResult.data.appAuthHistories)
      lastId = data[data.length - 1].id
    }
  } while (data.length > 0)

  // Let's convert this array in a dictionary
  const authHistory = rawHistory.reduce((acc, curr) => {
    const stakingProvider = curr.appAuthorization.stake.id
    const historyElem = {
      amount: curr.amount,
      timestamp: curr.timestamp,
      eventType: curr.eventType,
      beneficiary: curr.appAuthorization.stake.beneficiary,
    }
    acc[stakingProvider] = acc[stakingProvider] || []
    acc[stakingProvider].push(historyElem)
    return acc
  }, {})

  return authHistory
}

// Return the TACo operators that have been confirmed before a timestamp
// The graphqlClient passed must be for Polygon staking subgraph
async function getOpsConfirmedUntil(graphqlClient, endTimestamp) {
  const opsConfirmedQuery = gql`
    query tacoOperators($endTimestamp: Int) {
      tacoOperators(
        where: { confirmedTimestampFirstOperator_lte: $endTimestamp }
      ) {
        id
        operator
        confirmedTimestampFirstOperator
      }
    }
  `

  const queryResult = await graphqlClient
    .query(opsConfirmedQuery, { endTimestamp: endTimestamp })
    .toPromise()
  if (queryResult.error || queryResult.data.length === 0) {
    console.error("ERROR: No TACo operators retrieved\n" + queryResult.error)
    return []
  }

  const opsConfirmed = queryResult.data.tacoOperators.reduce((acc, cur) => {
    acc[cur.id] = {
      operator: cur.operator,
      confirmedTimestamp: cur.confirmedTimestampFirstOperator,
    }
    return acc
  }, {})

  return opsConfirmed
}

//
// Return the TACo rewards calculated for a period of time
//
async function getTACoRewards(
  mainnetClient,
  polygonClient,
  startPeriodTimestamp,
  endPeriodTimestamp,
  tacoWeight
) {
  const opsConfirmed = await getOpsConfirmedUntil(
    polygonClient,
    endPeriodTimestamp
  )
  const tacoAuthHistories = await getTACoAuthHistoryUntil(
    mainnetClient,
    endPeriodTimestamp
  )

  const confirmedAuthHistories = {}
  // Filter those stakes that have not a confirmed operator and add the
  // confirmed operator timestamp to every history event and it also adds
  // which of these two timestamp is the greater
  Object.keys(opsConfirmed).map((stProv) => {
    if (tacoAuthHistories[stProv]) {
      confirmedAuthHistories[stProv] = tacoAuthHistories[stProv].map(
        (historyEvent) => {
          const event = historyEvent
          event.opConfirmedTimestamp = opsConfirmed[stProv].confirmedTimestamp
          event.greatestTimestamp =
            Number(event.timestamp) > Number(event.opConfirmedTimestamp)
              ? Number(event.timestamp)
              : Number(event.opConfirmedTimestamp)
          return event
        }
      )
    }
  })

  const rewards = {}
  Object.keys(confirmedAuthHistories).map((stProv) => {
    // Take the first event: this is, the event whose timestamp or
    // opConfirmedTimestamp (the oldest of both) is closer to (and preferably
    // lower than) start period time
    const firstEvent = confirmedAuthHistories[stProv].reduce((acc, cur) => {
      const accTimestamp = Number(acc.timestamp)
      const curTimestamp = Number(cur.timestamp)

      let event = curTimestamp < accTimestamp ? cur : acc

      // if both events are previous to start period, take the later
      if (
        curTimestamp < startPeriodTimestamp &&
        accTimestamp < startPeriodTimestamp
      ) {
        event = curTimestamp > accTimestamp ? cur : acc
      }

      return event
    }, confirmedAuthHistories[stProv][0])

    // discard the events previous to the first event
    const filteredEvents = confirmedAuthHistories[stProv].filter(
      (event) => Number(event.timestamp) >= Number(firstEvent.timestamp)
    )

    // sorting the events
    const sortedEvents = filteredEvents.sort(
      (a, b) => Number(a.timestamp) < Number(b.timestamp)
    )

    const epochs = []
    // based on these auth events, let's create authorization epochs
    for (let i = 0; i < sortedEvents.length; i++) {
      let duration = 0
      let epochStartTime = Number(sortedEvents[i].timestamp)
      // first epoch start time has a special treatment
      if (i === 0) {
        // greatestTimestamp is the bigger value between event timestamp and
        // operator confirmed timestamp
        epochStartTime =
          sortedEvents[i].greatestTimestamp < startPeriodTimestamp
            ? startPeriodTimestamp
            : sortedEvents[i].greatestTimestamp
      }

      if (sortedEvents[i + 1]) {
        duration = Number(sortedEvents[i + 1].timestamp) - epochStartTime
        // if no more events, the end timestamp is endPeriodTimestamp
      } else {
        duration = endPeriodTimestamp - epochStartTime
      }

      const epoch = {
        amount: sortedEvents[i].amount,
        startTime: epochStartTime,
        duration: duration,
        beneficiary: sortedEvents[i].beneficiary,
      }
      epochs.push(epoch)
    }

    const rewardsAPR = 0.15 * 100
    const tacoAllocation = tacoWeight * 100
    const conversion_denominator = 100 * 100

    // Calculating the rewards for each epoch
    const reward = epochs.reduce((total, cur) => {
      const epochReward = BigNumber(cur.amount)
        .times(rewardsAPR)
        .times(tacoAllocation)
        .times(cur.duration)
        .div(SECONDS_IN_YEAR * conversion_denominator)
      return total.plus(epochReward)
    }, BigNumber(0))

    const stProvCheckSum = ethers.utils.getAddress(stProv)
    const beneficiaryCheckSum = ethers.utils.getAddress(epochs[0].beneficiary)

    rewards[stProvCheckSum] = {
      beneficiary: beneficiaryCheckSum,
      amount: reward.toFixed(0),
    }
  })

  return rewards
}

// Return all the TACo commitments done
// The graphqlClient passed must be for Ethereum mainnet staking subgraph
async function getTACoCommitments(graphqlClient) {
  const tacoCommitsQuery = gql`
    query TacoCommitments {
      tacoCommitments(first: 1000) {
        id
        endCommitment
        duration
      }
    }
  `

  const queryResult = await graphqlClient.query(tacoCommitsQuery).toPromise()
  if (queryResult.error || queryResult.data.length === 0) {
    console.error("ERROR: No TACo commitments retrieved\n" + queryResult.error)
    return []
  }

  const commitments = queryResult.data.tacoCommitments.reduce((acc, curr) => {
    const stakingProvider = curr.id
    const commitElement = {
      endCommitment: curr.endCommitment,
      duration: curr.duration,
    }
    acc[stakingProvider] = commitElement
    return acc
  }, {})

  return commitments
}

// Return all the rewards earned by stakes that did the TACo commitment
// The graphqlClient passed must be for Ethereum mainnet staking subgraph
async function getCommitmentBonus(subgraphClient) {
  const commitmentDeadline = 1705363199
  const tacoCommits = await getTACoCommitments(subgraphClient)
  const tacoAuthHistories = await getTACoAuthHistoryUntil(
    subgraphClient,
    commitmentDeadline
  )

  const rewards = {}
  Object.keys(tacoCommits).map((stProv) => {
    const stProvCheckSum = ethers.utils.getAddress(stProv)
    const beneficiaryCheckSum = ethers.utils.getAddress(
      tacoAuthHistories[stProv][0].beneficiary
    )
    const duration = tacoCommits[stProv].duration
    // taking the greater amount of authorization because the authorization
    // could be increased since the beginning but not decreased (it requires 6
    // month period to approve the decrease)
    const authorized = tacoAuthHistories[stProv].reduce((prev, elem) => {
      const authorized = BigNumber(elem.amount)
      return authorized.gt(prev) ? authorized : prev
    }, BigNumber(0))

    let reward = BigNumber(0)
    if (duration === 3) {
      reward = authorized.times(0.005)
    } else if (duration === 6) {
      reward = authorized.times(0.01)
    } else if (duration === 12) {
      reward = authorized.times(0.02)
    } else if (duration === 18) {
      reward = authorized.times(0.03)
    }

    rewards[stProvCheckSum] = {
      amount: reward.toFixed(0),
      beneficiary: beneficiaryCheckSum,
    }
  })

  return rewards
}

module.exports = {
  getTACoRewards,
  getCommitmentBonus,
}
