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

  // Take the most recent confirmed operator event for each staking provider
  const filtRawLogs = []
  rawLogs.forEach((log) => {
    const lastLog = rawLogs.findLast((elem) => elem.topics[1] === log.topics[1])
    if (lastLog.transactionHash === log.transactionHash) {
      filtRawLogs.push(log)
    }
  })

  const parsedLogs = filtRawLogs.map((log) => eventIntrfc.parseLog(log))

  const logsTimestamps = {}
  const promises = filtRawLogs.map((log, logIndex) => {
    return provider.getBlock(log.blockHash).then((block) => {
      const stProv = parsedLogs[logIndex].args.stakingProvider
      logsTimestamps[stProv] = block.timestamp
    })
  })
  await Promise.all(promises)

  // Check if events were confirmed before provided timestamp
  const filtParsedLogs = parsedLogs.filter(
    (log) => logsTimestamps[log.args.stakingProvider] <= timestamp
  )

  const opsConfirmed = {}
  filtParsedLogs.map((log) => {
    const stProv = log.args.stakingProvider
    opsConfirmed[stProv] = {
      confirmedTimestamp: logsTimestamps[stProv],
      operator: log.args.operator,
    }
  })

  return opsConfirmed
}

module.exports = { getOperatorConfirmedEvent, getOperatorsConfirmed }
