const { gql } = require("@urql/core")
const { BigNumber } = require("bignumber.js")
const { ethers } = require("ethers")

// The Graph limits GraphQL queries to 1000 results max
const RESULTS_PER_QUERY = 1000
const TACoChildApplicationAdd = "0xFa07aaB78062Fac4C36995bF28F6D677667973F5"
const eventSignature = "OperatorConfirmed(address,address)"
const eventTopic = ethers.utils.id(eventSignature)
const eventAbi =
  // eslint-disable-next-line quotes
  '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"stakingProvider","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"}],"name":"OperatorConfirmed","type":"event"}]'

// Return the history of TACo authorization changes until a given timestamp
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

// Return all the TACo commitments made
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

// Return the operator confirmed event for the provided staking provider
async function getOperatorConfirmedEvent(stakingProvider) {
  const eventIntrfc = new ethers.utils.Interface(eventAbi)
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  )

  const rawLogs = await provider.getLogs({
    address: TACoChildApplicationAdd,
    topics: [
      eventTopic,
      ethers.utils.hexZeroPad(stakingProvider.toLowerCase(), 32),
    ],
    fromBlock: 50223997,
  })

  if (rawLogs.length === 0) {
    return undefined
  }

  // Take the most recent Operator confirmed event
  const log = rawLogs.reduce((acc, val) => {
    return acc > val ? acc : val
  })
  const parsedLog = eventIntrfc.parseLog(log)

  const operatorInfo = {
    stakingProvider: stakingProvider,
    operator: parsedLog.args.operator,
    blockNumber: log.blockNumber,
  }

  return operatorInfo
}

// Return the TACo operators confirmed before provided timestamp
// Note: each returned operator object will contain the timestamp of the oldest
// operator confirmed but the address of the most recent operator.
async function getOperatorsConfirmed(timestamp) {
  if (!timestamp) {
    timestamp = Math.floor(Date.now() / 1000)
  }

  const eventIntrfc = new ethers.utils.Interface(eventAbi)
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  )

  // TODO: as stated in ethers.js docs, many backends will discard old events.
  // Use subgraph instead
  const rawLogs = await provider.getLogs({
    address: TACoChildApplicationAdd,
    topics: [eventTopic],
    fromBlock: 50223997,
  })

  // Get the timestamps for each operator confirmed event
  const logsTimestamps = {}
  const promises = rawLogs.map((log) => {
    return provider.getBlock(log.blockHash).then((block) => {
      logsTimestamps[block.number] = block.timestamp
    })
  })
  await Promise.all(promises)

  // Check if events were confirmed before provided timestamp
  const filtRawLogs = rawLogs.filter((log) => {
    return logsTimestamps[log.blockNumber] <= timestamp
  })

  const opsConfirmed = {}
  filtRawLogs.map((filtRawLog) => {
    const stProvLogs = filtRawLogs.filter(
      (log) => log.topics[1] === filtRawLog.topics[1]
    )
    const firstStProvLog = stProvLogs[0]
    const latestStProvLog = stProvLogs[stProvLogs.length - 1]

    const latestStProvLogParsed = eventIntrfc.parseLog(latestStProvLog)
    const stProv = latestStProvLogParsed.args.stakingProvider

    opsConfirmed[stProv] = {
      confirmedTimestamp: logsTimestamps[firstStProvLog.blockNumber],
      operator: latestStProvLogParsed.args.operator,
    }
  })

  return opsConfirmed
}

module.exports = {
  getCommitmentBonus,
  getOperatorConfirmedEvent,
  getOperatorsConfirmed,
}
