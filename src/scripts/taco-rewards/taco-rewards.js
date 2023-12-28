const { ethers } = require("ethers")

async function getOperatorConfirmedEvent(stakingProvider) {
  const TACoChildApplicationAdd = "0xFa07aaB78062Fac4C36995bF28F6D677667973F5"
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  )
  const eventSignature = "OperatorConfirmed(address,address)"
  const eventTopic = ethers.utils.id(eventSignature)
  const eventAbi =
    // eslint-disable-next-line quotes
    '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"stakingProvider","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"}],"name":"OperatorConfirmed","type":"event"}]'
  const eventIntrfc = new ethers.utils.Interface(eventAbi)

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

module.exports = { getOperatorConfirmedEvent }
