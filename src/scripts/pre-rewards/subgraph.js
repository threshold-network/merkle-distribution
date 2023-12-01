require("isomorphic-unfetch")
const { createClient, gql } = require("@urql/core")
const { ethers } = require("ethers")
const BigNumber = require("bignumber.js")
const {
  abi: tokenStakingAbi,
} = require("@threshold-network/solidity-contracts/artifacts/TokenStaking.json")
const Constants = require("./constants.js")

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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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

// For a specific block, return a list of stakes whose tokens were staked in Nu
// or Keep staking contracts. These staked tokens were registred as nuInT and
// keepInT in the Threshold staking contract.
async function getLegacyStakes(gqlClient, blockNumber) {
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
        }
      }
    }
  `

  const response = await gqlClient
    .query(legacyStakersQuery, { blockNumber: blockNumber })
    .toPromise()

  if (response.error) {
    console.error(`Error: ${response.error.message}`)
    return null
  }

  if (!response.data) {
    console.error("No data found")
    return null
  }

  const stakers = response.data["accounts"]

  return stakers
}

// For a specific stake at a specific block, return the Threshold Network apps
// authorizations. Note: if blockNumber provided, rpcUrl must address to an
// archive node
async function getStakeAuthorizations(rpcUrl, stakingProvider, blockNumber) {
  if (!blockNumber) {
    blockNumber = "latest"
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

  const tokenStakingContract = new ethers.Contract(
    Constants.tokenStakingProxyAddress,
    tokenStakingAbi,
    provider
  )

  const walletRegistryAuthorization =
    await tokenStakingContract.authorizedStake(
      stakingProvider,
      Constants.walletRegistryAddress,
      { blockTag: blockNumber }
    )
  const RandomBeaconAuthorization = await tokenStakingContract.authorizedStake(
    stakingProvider,
    Constants.randomBeaconAddress,
    { blockTag: blockNumber }
  )

  const authorizations = {
    WalletRegistry: walletRegistryAuthorization.toString(),
    RandomBeacon: RandomBeaconAuthorization.toString(),
  }

  return authorizations
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
  epochs[lastEpochIndex].duration =
    endTimestamp - epochs[lastEpochIndex].timestamp

  // Clean the empty epochs
  epochs = epochs.filter((epoch) => {
    return epoch.stakes.length > 0
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
 * @param {string}  stakingProvider   Staking provider address
 * @param {Number}  [startTimestamp]  Will show only events after this time
 * @return {Object}                   The stake's data
 */
exports.getStakingHistory = async function (
  gqlUrl,
  stakingProvider,
  startTimestamp
) {
  if (!ethers.utils.isAddress(stakingProvider)) {
    console.error("Error: Invalid Staking Provider address")
    return
  }

  const timestamp = startTimestamp ? startTimestamp : 0

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
        resultsPerQuery: Constants.gqlResultsPerQuery,
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

  let stakedAmount = 0
  let stakingHistory = epochStakes.map((epoch, index) => {
    const epochAmount = parseInt(epoch.amount)

    if (epoch.epoch.timestamp <= timestamp || epochAmount === stakedAmount) {
      return null
    }

    const historyElement = { epoch: epoch.epoch.id }
    if (index === 0) {
      historyElement.event = "staked"
    } else {
      historyElement.event =
        epochAmount > stakedAmount ? "topped-up" : "unstaked"
    }
    historyElement.prevAmountStaked = (stakedAmount / 10 ** 18).toFixed()
    historyElement.currAmountStaked = (epochAmount / 10 ** 18).toFixed()
    historyElement.timestamp = new Date(
      epoch.epoch.timestamp * 1000
    ).toISOString()
    stakedAmount = epochAmount

    return historyElement
  })

  stakingHistory = stakingHistory.filter(
    (historyElement) => historyElement !== null
  )

  return stakingHistory
}

/**
 * Get the data about legacy stakes, i.e., stakes that originally were set in
 * Nucypher and Keep staking contracts in Nu and Keep tokens respectively.
 * These stakes were migrated to Threshold staking contract by swapping them to
 * T token. The staked tokens that comes from legacy tokens were given the name
 * of nuInT and keepInT respectively in Threshold staking contract.
 * @param {string}  gqlUrl            Subgraph's GraphQL API URL
 * @param {string}  rpcUrl            Web3 provider URL. Must be a archive node
 * @param {Number}  blockNumber       Block height at which data will be taken
 * @return {Object}                   The stake's data
 */
exports.getLegacyStakesInfo = async function (gqlUrl, rpcUrl, blockNumber) {
  const stakes = {}
  const authPromises = []

  const gqlClient = createClient({ url: gqlUrl, maskTypename: true })

  const ownerList = await getLegacyStakes(gqlClient, blockNumber)
  if (!ownerList) {
    return {}
  }

  for (let ownerIndex = 0; ownerIndex < ownerList.length; ownerIndex++) {
    const ownerStakes = ownerList[ownerIndex]
    for (let i = 0; i < ownerStakes.stakes.length; i++) {
      const stake = ownerStakes.stakes[i]

      if (stake.keepInTStake === "0" && stake.nuInTStake === "0") {
        continue
      }

      stakes[stake.id] = {
        owner: ownerStakes.id,
        keepInTStake: stake.keepInTStake,
        nuInTStake: stake.nuInTStake,
        tStake: stake.tStake,
      }

      const authPromise = getStakeAuthorizations(
        rpcUrl,
        stake.id,
        blockNumber
      ).then((auths) => {
        stakes[stake.id].authorizations = auths
      })

      authPromises.push(authPromise)
    }
  }

  await Promise.all(authPromises)

  return stakes
}
