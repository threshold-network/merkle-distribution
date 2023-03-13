const { task } = require("hardhat/config")
const fs = require("fs")
const { utils } = require("ethers")

task(
  "claim-rewards",
  "Claim the accumulated staking rewards",
  async function (taskArguments, hre) {
    const { getNamedAccounts } = hre
    let { stakingProvider } = taskArguments
    const { claimer } = await getNamedAccounts()

    let merkleRoot
    let distStake

    try {
      stakingProvider = utils.getAddress(stakingProvider)
    } catch (error) {
      console.error(`Error with staking provider address: ${error.reason}`)
      return
    }

    // Take the JSON of last distribution
    try {
      const distsJson = JSON.parse(
        fs.readFileSync("distributions/distributions.json")
      )
      const dists = Object.keys(
        distsJson["CumulativeAmountByDistribution"]
      ).sort()
      const lastDist = dists[dists.length - 1]
      const dist = JSON.parse(
        fs.readFileSync(`distributions/${lastDist}/MerkleDist.json`)
      )
      merkleRoot = dist.merkleRoot
      distStake = dist.claims[stakingProvider]
    } catch (error) {
      console.error(error)
      return
    }

    console.log(merkleRoot)
    console.log(distStake)
    console.log(claimer)
  }
).addParam("stakingProvider", "The staking provider address")
