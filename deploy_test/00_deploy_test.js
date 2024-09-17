const hre = require("hardhat")
const { ethers } = hre

module.exports = async ({ deployments, getNamedAccounts }) => {
  console.log("running test deployment script on mainnet fork")
  if (
    (hre.network.config.forking && hre.network.config.forking.enabled) !== true
  ) {
    console.log("Error: Ethereum mainnet not being forked")
    console.log("Check FORKING_URL env var in .env file")
    return
  }

  const { deploy } = deployments

  const {
    deployer,
    tokenContract,
    tacoApp,
    oldCumulativeMerkleDrop,
    merkleRewardsHolder,
    owner,
  } = await getNamedAccounts()

  const args = [tokenContract, tacoApp, oldCumulativeMerkleDrop, merkleRewardsHolder, owner]
  const rewardsAggregator = await deploy("RewardsAggregator", {from: deployer, args})

  console.log("RewardsAggregator deployed to:", rewardsAggregator.address)

}
