const hre = require("hardhat")

module.exports = async () => {
  console.log("running test deployment script")
  if (
    (hre.network.config.forking && hre.network.config.forking.enabled) !== true
  ) {
    console.log("Error: Ethereum mainnet not being forked")
    console.log("Check FORKING_URL env var in .env file")
    return
  }
}
