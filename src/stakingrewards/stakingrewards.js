require("isomorphic-unfetch")
const { createClient, gql } = require("@urql/core")
const { ethers } = require("ethers")
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")
const BigNumber = require("bignumber.js")

const SECONDS_IN_YEAR = 31536000

async function getEpochById(gqlClient, epochId) {
  let data

  const FIRST_EPOCH_QUERY = gql`
    query FirstEpoch($id: String) {
      epoch(id: $id) {
        id
        timestamp
        duration
        totalAmount
        stakes(first: 1000) {
          stakingProvider
          owner
          amount
        }
      }
    }
  `

  await gqlClient
    .query(FIRST_EPOCH_QUERY, { id: epochId.toString() })
    .toPromise()
    .then((result) => {
      data = result.data.epoch
    })

  return data
}

async function getEpochsBetweenDates(gqlClient, startTimestamp, endTimestamp) {
  let data

  // TODO: Max amount of items you can get in a query is 100.
  // adding 'first: 1000' is a WA to get more than 100 stakes,
  // but the most correct option is to use GraphQL pagination.
  const ONGOING_STAKES_QUERY = gql`
    query OngoingStakes($startTimestamp: String, $endTimestamp: String) {
      epoches(
        first: 1000
        orderBy: timestamp
        where: { timestamp_gte: $startTimestamp, timestamp_lte: $endTimestamp }
      ) {
        id
        timestamp
        duration
        totalAmount
        stakes(first: 1000) {
          stakingProvider
          owner
          amount
        }
      }
    }
  `

  await gqlClient
    .query(ONGOING_STAKES_QUERY, {
      startTimestamp: startTimestamp.toString(),
      endTimestamp: endTimestamp.toString(),
    })
    .toPromise()
    .then((result) => {
      data = result.data.epoches
    })

  return data
}

async function getOperatorsConfirmedBeforeDate(gqlClient, timestamp) {
  let data

  // TODO: Max amount of items you can get in a query is 100.
  // adding 'first: 1000' is a WA to get more than 100 stakes,
  // but the most correct option is to use GraphQL pagination.
  const OPS_CONF_BETWEEN_DATES = gql`
    query SimplePREApplications($timestamp: String) {
      simplePREApplications(
        first: 1000
        where: { confirmedTimestamp_lte: $timestamp }
      ) {
        bondedTimestamp
        confirmedTimestamp
        id
        operator
      }
    }
  `

  await gqlClient
    .query(OPS_CONF_BETWEEN_DATES, {
      timestamp: timestamp.toString(),
    })
    .toPromise()
    .then((result) => {
      data = result.data?.simplePREApplications
    })

  return data
}

async function getStakeDatasInfo(gqlClient) {
  let data

  // TODO: Max amount of items you can get in a query is 100.
  // adding 'first: 1000' is a WA to get more than 100 stakes,
  // but the most correct option is to use GraphQL pagination.
  const STAKES_DATA_INFO = gql`
    query stakeDatasInfo {
      stakeDatas(first: 1000) {
        beneficiary
        id
        authorizer
        owner {
          id
        }
      }
    }
  `

  await gqlClient
    .query(STAKES_DATA_INFO)
    .toPromise()
    .then((result) => {
      data = result.data?.stakeDatas
    })

  return data
}

/**
 * Combine two Merkle distribution inputs, adding the amounts and taking the
 * beneficiary of the second input
 * @param {Object} baseMerkleInput  Merkle input used as base
 * @param {Object} addedMerkleInput Merkle input to be added
 * @return {Object}                 Combination of two Merkle inputs
 */
exports.combineMerkleInputs = function (baseMerkleInput, addedMerkleInput) {
  const combined = JSON.parse(JSON.stringify(baseMerkleInput))
  Object.keys(addedMerkleInput).map((stakingProvider) => {
    const combinedClaim = combined[stakingProvider]
    const addedClaim = addedMerkleInput[stakingProvider]
    if (combinedClaim) {
      combinedClaim.beneficiary = addedClaim.beneficiary
      combinedClaim.amount = BigNumber(combinedClaim.amount)
        .plus(BigNumber(addedClaim.amount))
        .toFixed()
    } else {
      combined[stakingProvider] = {
        beneficiary: addedClaim.beneficiary,
        amount: addedClaim.amount,
      }
    }
  })
  return combined
}

/**
 * Generate a Merkle distribution from Merkle distribution input
 * @param {Object} merkleInput      Merkle input generated from rewards
 * @return {Object}                 Merkle distribution
 */
exports.genMerkleDist = function (merkleInput) {
  const stakingProviders = Object.keys(merkleInput)
  const data = Object.values(merkleInput)

  const elements = stakingProviders.map(
    (stakingProvider, i) =>
      stakingProvider +
      data[i].beneficiary.substr(2) +
      BigNumber(data[i].amount).toString(16).padStart(64, "0")
  )

  const tree = new MerkleTree(elements, keccak256, {
    hashLeaves: true,
    sort: true,
  })

  const root = tree.getHexRoot()
  const leaves = tree.getHexLeaves()
  const proofs = leaves.map(tree.getHexProof, tree)

  const totalAmount = data
    .map((claim) => BigNumber(claim.amount))
    .reduce((a, b) => a.plus(b))
    .toFixed()

  const claims = Object.entries(merkleInput).map(([stakingProvider, data]) => {
    const leaf = MerkleTree.bufferToHex(
      keccak256(
        stakingProvider +
          data.beneficiary.substr(2) +
          BigNumber(data.amount).toString(16).padStart(64, "0")
      )
    )
    return {
      stakingProvider: stakingProvider,
      beneficiary: data.beneficiary,
      amount: data.amount,
      proof: proofs[leaves.indexOf(leaf)],
    }
  })

  const dist = {
    totalAmount: totalAmount,
    merkleRoot: root,
    claims: claims.reduce(
      (a, { stakingProvider, beneficiary, amount, proof }) => {
        a[stakingProvider] = { beneficiary, amount, proof }
        return a
      },
      {}
    ),
  }

  return dist
}

/**
 * Generate the ongoing rewards earned by stakes since a specific date and
 * return it in Merkle distribution input format
 * @param {string}  gqlURL          Subgraph GraphQL API URL
 * @param {Number} startTimestamp   Start date UNIX timestamp
 * @param {Number}  endTimestamp    End date UNIX timestamp
 * @return {Object}                 The ongoing rewards of each stake
 */
exports.getOngoingMekleInput = async function (
  gqlUrl,
  startTimestamp,
  endTimestamp
) {
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

  // Calculate the reward of each stake
  // Rewards formula: r = (s_1 * y_t) * t / 365; where y_t is 0.15
  const rewards = {}
  Object.keys(stakeList).map((stakingProvider) => {
    let reward = BigNumber(0)

    const stake = stakeList[stakingProvider]

    // Check if operator is confirmed and when
    const opConf = opsConfirmed.find((op) => op.id === stakingProvider)
    const opConfTimestamp = opConf ? opConf.confirmedTimestamp : undefined
    if (opConfTimestamp) {
      reward = stake.reduce((total, epochStake) => {
        let epochReward = BigNumber(0)
        const stakeAmount = BigNumber(epochStake.amount)
        const epochTimestamp = parseInt(epochStake.epochTimestamp)
        let epochDuration = epochStake.epochDuration
          ? parseInt(epochStake.epochDuration)
          : currentTime - epochStake.epochTimestamp

        // If the operator was confirmed in the middle of this epoch...
        if (
          opConfTimestamp > epochTimestamp &&
          opConfTimestamp <= epochTimestamp + epochDuration
        ) {
          epochDuration = epochTimestamp + epochDuration - opConfTimestamp
        }

        epochReward = stakeAmount
          .times(15)
          .times(epochDuration)
          .div(SECONDS_IN_YEAR * 100)

        return total.plus(epochReward)
      }, BigNumber(0))
    }

    if (!reward.isZero()) {
      // Find the beneficiary of this reward
      const stakeDatasItem = stakeDatas.find(
        (stake) => stake.id === stakingProvider
      )
      const beneficiary = stakeDatasItem.beneficiary

      const stProvCheckSum = ethers.utils.getAddress(stakingProvider)
      rewards[stProvCheckSum] = {
        beneficiary: ethers.utils.getAddress(beneficiary),
        amount: reward.toFixed(0),
      }
    }
  })

  return rewards
}

/**
 * Generate the bonus rewards earned by stakes between June 1st and July 15th
 * and return it in Merkle distribution input format
 * @param {string}  gqlURL          Subgraph GraphQL API URL
 * @return {BigNumber}              The amount of generated rewards
 */
exports.getBonusMerkleInput = async function (gqlUrl) {
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

  const rewards = {}

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

      // Calculate the earning of this stake r = 0.03 * initial_amount
      const reward = epochStakes[0].amount.times(0.03)

      const stProvCheckSum = ethers.utils.getAddress(stakingProvider)
      rewards[stProvCheckSum] = {
        beneficiary: ethers.utils.getAddress(beneficiary),
        amount: reward.toFixed(0),
      }
    }
  })

  return rewards
}