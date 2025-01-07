const networks = {}
const etherscan = { apiKey: {} }

function register(
  name,
  deploy,
  chainId,
  url,
  privateKey,
  etherscanNetworkName,
  etherscanKey
) {
  if (url && privateKey && etherscanKey) {
    networks[name] = {
      url,
      chainId,
      accounts: [privateKey],
      deploy,
    }
    etherscan.apiKey[etherscanNetworkName] = etherscanKey
    console.log(`Network '${name}' registered`)
  } else {
    console.log(`Network '${name}' not registered`)
  }
}

register(
  "mainnet",
  ["deploy"],
  1,
  process.env.MAINNET_RPC_URL,
  process.env.MAINNET_PRIVATE_KEY,
  "mainnet",
  process.env.ETHERSCAN_TOKEN
)
register(
  "sepolia",
  ["deploy"],
  11155111,
  process.env.SEPOLIA_RPC_URL,
  process.env.SEPOLIA_PRIVATE_KEY,
  "sepolia",
  process.env.ETHERSCAN_TOKEN
)

networks["hardhat"] = {
  forking: {
    enabled: !!process.env.FORKING_URL,
    url: process.env.FORKING_URL || "",
    blockNumber: 20775560,
  },
}

module.exports = {
  networks,
  etherscan,
}
