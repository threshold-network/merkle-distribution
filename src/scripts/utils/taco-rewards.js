const { getBuiltGraphSDK } = require("../../../.graphclient")
const { BigNumber } = require("bignumber.js")
const { ethers } = require("ethers")

const SECONDS_IN_YEAR = 31536000
const COORDINATOR_ADDRESS = "0xE74259e3dafe30bAA8700238e324b47aC98FE755"
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL
const COORDINATOR_ABI = [
  {
    type: "function",
    name: "getRitualState",
    stateMutability: "view",
    inputs: [
      {
        name: "ritualId",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum Coordinator.RitualState",
      },
    ],
  },
  {
    type: "function",
    name: "getParticipants",
    stateMutability: "view",
    inputs: [
      {
        name: "ritualId",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          {
            name: "provider",
            type: "address",
            internalType: "address",
          },
          {
            name: "aggregated",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "transcript",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "decryptionRequestStaticKey",
            type: "bytes",
            internalType: "bytes",
          },
        ],
        internalType: "struct Coordinator.Participant[]",
      },
    ],
  },
]

const RITUAL_STATE = {
  NON_INITIATED: 0,
  DKG_AWAITING_TRANSCRIPTS: 1,
  DKG_AWAITING_AGGREGATIONS: 2,
  DKG_TIMEOUT: 3,
  DKG_INVALID: 4,
  ACTIVE: 5,
  EXPIRED: 6,
}

const BETA_STAKERS = [
  "0xE4A3492c8b085aB5eDB6FDAE329f172056f6b04e",
  "0xa7baCa5A92842689359Fb1782e75D6eFF59152e6",
  "0x16fCc54E027a342F0683263eb43Cd9af1BD72169",
  "0xCC957f683a7e3093388946d03193Eee10086b900",
  "0xEAE5790C6eE3b6425f39D3Fd33644a7cb90C75A5",
  "0x02faA4286eF91247f8D09F36618D4694717F76bB",
  "0xBa1Ac67539c09AdDe63335635869c86f8e463514",
  "0xa6E3A08FaE33898fC31C4f6C7a584827D809352D",
  "0xDC09db6e5DA859eDeb7FC7bDCf47545056dC35F7",
  "0xdA08C16C86B78cD56CB10FDc0370EFc549d8638B",
  "0xC0B851DCBf00bA59D8B1f490aF93dEC4275cFFcC",
  "0x372626FF774573E82eb7D4545EE96F68F75aaFF6",
  "0xB88A62417eb9e6320AF7620BE0CFBE2dddd435A5",
  "0xb78F9EFE4F713feEFcAB466d2ee41972a0E45205",
  "0x5838636dCDd92113998FEcbcDeDf5B0d8bEB4920",
  "0xAAFc71044C2B832dDDFcedb0AE99695B0367dC57",
  "0x6dEE1fd2b29e2214a4f9aB9Ba5f3D17C8Cb56D11",
  "0x43df8c68a56249CC151dfb3a7E82cC7Fd624cF2a",
  "0x885fA88126955D5CFE0170A134e0300B8d3EfF47",
  "0x9Aa35dCE841A43693Cde23B86c394E1aEFb61c65",
  "0x331F6346C4c1bdb4Ef7467056C66250F0Eb8A44f",
  "0xc54238cac19bB8D57a9Bcdd28C3fdd49d82378D8",
  "0xBf40548b6Fd104C3cA9B2F6b2E2383301dB1c023",
  "0x621074D613Fc938bD9381AB77Ef3609a02432628",
  "0xB0C9F472b2066691Ab7FEE5b6702c28ab35888b2",
  "0xBDC3D611B79349e0b3d63833619875E89388298D",
  "0xc9909E3d0B87A1A2eB0f1194Ec5e3694464Ac522",
  "0x8afC0e9F8207975301893452bDeD1e8F2892f953",
  "0x58d665406Cf0F890daD766389DF879E84cc55671",
  "0x39A2D252769363D070a77fE3ad24b9954e1fB876",
  "0xE6C074228932F53C9E50928AD69DB760649A8C4d",
  "0xF2962794EbE69fc88F8dB441c1CD13b9F90B1Fe7",
  "0x557C836714aFd04f796686b0a50528714B549C74",
  "0x97d065B567cc4543D20dffaa7009f9aDe64d7E26",
  "0xc1268db05E7bD38BD85b2C3Fef80F8968a2c933A",
]

//
// Return the TACo operators that have been confirmed before a timestamp
// The graphqlClient passed must be for Polygon staking subgraph
//
async function getOpsConfirmedUntil(endTimestamp) {
  const { TACoOperators } = getBuiltGraphSDK()
  const { tacoOperators } = await TACoOperators({
    endTimestamp: endTimestamp,
    first: 3000,
    skip: 0,
  })

  const opsConfirmed = tacoOperators.reduce((acc, cur) => {
    acc[cur.id] = {
      operator: cur.operator,
      confirmedTimestamp: cur.confirmedTimestampFirstOperator,
    }
    return acc
  }, {})

  return opsConfirmed
}

//
// Return the history of TACo authorization changes until a given timestamp
// The graphqlClient passed must be for Ethereum mainnet staking subgraph
//
async function getTACoAuthHistoryUntil(endTimestamp) {
  const { TACoAuthHistoryQuery } = getBuiltGraphSDK()
  const { appAuthHistories } = await TACoAuthHistoryQuery({
    endTimestamp: endTimestamp,
    first: 3000,
    skip: 0,
  })

  // Let's convert this array into a dictionary
  const authHistory = appAuthHistories.reduce((acc, curr) => {
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

//
// Return the TACo rewards calculated for a period of time
//
async function getPotentialRewards(
  startPeriodTimestamp,
  endPeriodTimestamp,
  tacoWeight
) {
  const opsConfirmed = await getOpsConfirmedUntil(endPeriodTimestamp)
  const tacoAuthHistories = await getTACoAuthHistoryUntil(endPeriodTimestamp)

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
      const capAmount = BigNumber(cur.amount).gt(15000000 * 10 ** 18)
        ? BigNumber(15_000_000 * 10 ** 18)
        : BigNumber(cur.amount)
      const epochReward = capAmount
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

//
// Return a list of nodes that didn't complete some DKG ritual
// Accept as argument the list of heartbeat rituals:
// {30: ["0x11...", 0x22..."], 31: ["0x33...", "0x44..."],...}
//
async function getHeartbeatNodesFailures(heartbeatRituals) {
  if (!POLYGON_RPC_URL) {
    throw "Polygon RPC URL not set"
  }

  const failedNodes = {}

  const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL)
  const coordinator = new ethers.Contract(
    COORDINATOR_ADDRESS,
    COORDINATOR_ABI,
    provider
  )

  for (const ritualID of Object.keys(heartbeatRituals)) {
    const ritualState = await coordinator.getRitualState(ritualID)
    if (
      ritualState === RITUAL_STATE.DKG_AWAITING_TRANSCRIPTS ||
      ritualState === RITUAL_STATE.DKG_AWAITING_AGGREGATIONS
    ) {
      console.error(`Error: Ritual #${ritualID} is still in DKG phase`)
      console.error("Penalties must be calculated after DKG timeout")
      throw "Ritual not finalized"
    } else if (
      ritualState === RITUAL_STATE.DKG_TIMEOUT ||
      ritualState === RITUAL_STATE.DKG_INVALID ||
      ritualState === RITUAL_STATE.NON_INITIATED
    ) {
      console.log(`▶ Ritual #${ritualID} failed. State: ${ritualState}`)
      const ritualParticipants = await coordinator.getParticipants(ritualID)
      for (const participant of ritualParticipants) {
        if (!participant.transcript || participant.transcript === "0x") {
          console.log(
            `  ! Missing transcript of participant ${participant.provider}`
          )
          if (!failedNodes[participant.provider]) {
            failedNodes[participant.provider] = []
          }
          failedNodes[participant.provider].push(ritualID)
        }
      }
    }
  }

  return failedNodes
}

//
// Set the rewards for Beta Stakers to zero (TIP-092 and TIP-100)
//
function setBetaStakerRewardsToZero(potentialRewards) {
  const tacoRewards = JSON.parse(JSON.stringify(potentialRewards))

  BETA_STAKERS.map((stProv) => {
    if (tacoRewards[stProv]) {
      tacoRewards[stProv].amount = "0"
    }
  })

  return tacoRewards
}

//
// Calculate the penalties for the TACo rewards
//
function applyPenalties(potentialRewards, failedHeartbeats) {
  // Copy the object to avoid modifying the original
  const tacoRewards = JSON.parse(JSON.stringify(potentialRewards))

  Object.keys(failedHeartbeats).map((stProv) => {
    // If the node failed 2 heartbeats, penalize 1/3 of the reward
    if (failedHeartbeats[stProv].length === 2) {
      tacoRewards[stProv].amount = BigNumber(potentialRewards[stProv].amount)
        .times(2)
        .div(3)
        .toFixed(0)
      // If the node failed 3 heartbeats, penalize 2/3 of the reward
    } else if (failedHeartbeats[stProv].length === 3) {
      tacoRewards[stProv].amount = BigNumber(potentialRewards[stProv].amount)
        .div(3)
        .toFixed(0)
      // If the node failed 4 or more heartbeats, penalize all the reward
    } else if (failedHeartbeats[stProv].length >= 4) {
      tacoRewards[stProv].amount = BigNumber(0).toFixed(0)
    }
  })

  return tacoRewards
}

module.exports = {
  getPotentialRewards,
  getHeartbeatNodesFailures,
  setBetaStakerRewardsToZero,
  applyPenalties,
}
