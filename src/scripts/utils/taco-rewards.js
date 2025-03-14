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
async function getTACoRewards(
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
async function getFailedHeartbeats(heartbeatRituals) {
  if (!POLYGON_RPC_URL) {
    throw "Polygon RPC URL not set"
  }

  const failedHeartbeats = {}

  const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL)
  const coordinator = new ethers.Contract(
    COORDINATOR_ADDRESS,
    COORDINATOR_ABI,
    provider
  )

  for (const ritualID of Object.keys(heartbeatRituals)) {
    const ritualState = await coordinator.getRitualState(ritualID)
    if (
      ritualState !== RITUAL_STATE.ACTIVE ||
      ritualState !== RITUAL_STATE.EXPIRED
    ) {
      if (
        ritualState === RITUAL_STATE.DKG_AWAITING_TRANSCRIPTS ||
        ritualState === RITUAL_STATE.DKG_AWAITING_AGGREGATIONS
      ) {
        console.warn(`Warning: Ritual #${ritualID} is still in DKG phase`)
      } else if (
        ritualState === RITUAL_STATE.DKG_TIMEOUT ||
        ritualState === RITUAL_STATE.DKG_INVALID
      ) {
        console.log(`Ritual #${ritualID} not completed`)
        const participants = await coordinator.getParticipants(ritualID)
        for (const participant of participants) {
          if (!participant.transcript) {
            console.log(
              `Missing transcript of participant ${participant.provider} in ritual #${ritualID}`
            )
            if (!failedHeartbeats[participant.provider]) {
              failedHeartbeats[participant.provider] = []
            }
            failedHeartbeats[participant.provider].append(ritualID)
          }
        }
      }
    }
  }

  // return failedHeartbeats
  return { "0x5566": [30, 31], "0x7788": [32, 33] }
}

//
// Return a list of nodes penalties
// Accept as argument the list of failed heartbeats
// {"0x5566": [30, 31], "0x7788": [32, 33]}
//
function calculateTACoPenalties(failedHeartbeats) {
  const penalties = {}

  Object.keys(failedHeartbeats).map((stProv) => {
    if (failedHeartbeats[stProv].length === 2) {
      penalties[stProv] = 1 / 3
    } else if (failedHeartbeats[stProv].length === 3) {
      penalties[stProv] = 2 / 3
    } else if (failedHeartbeats[stProv].length >= 4) {
      penalties[stProv] = 1
    }
  })

  return penalties
}

module.exports = {
  getTACoRewards,
  getFailedHeartbeats,
  calculateTACoPenalties,
}
