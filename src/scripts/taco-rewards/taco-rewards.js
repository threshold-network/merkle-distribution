const { ethers } = require("ethers")

const TACoChildApplicationAdd = "0xFa07aaB78062Fac4C36995bF28F6D677667973F5"
const eventSignature = "OperatorConfirmed(address,address)"
const eventTopic = ethers.utils.id(eventSignature)
const eventAbi =
  // eslint-disable-next-line quotes
  '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"stakingProvider","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"}],"name":"OperatorConfirmed","type":"event"}]'

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

module.exports = { getOperatorConfirmedEvent, getOperatorsConfirmed }
