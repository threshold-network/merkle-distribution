const { task } = require("hardhat/config")
const fs = require("fs")
const ora = require("ora")

const MERKLE_ADDRESS = "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37"

task(
  "claim-rewards",
  "Claim the accumulated staking rewards",
  async function (taskArguments, hre) {
    const { ethers } = hre

    let merkleRootDist
    let distStake

    let { stakingProvider } = taskArguments

    const [claimer] = await ethers.getSigners()

    try {
      stakingProvider = ethers.utils.getAddress(stakingProvider)
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
      merkleRootDist = dist.merkleRoot
      distStake = dist.claims[stakingProvider]
    } catch (error) {
      console.error(error)
      return
    }

    // Get the Merkle distribution contract
    const merkleDistContract = await ethers.getContractAt(
      "CumulativeMerkleDrop",
      MERKLE_ADDRESS
    )

    try {
      const merkleRootContract = await merkleDistContract.merkleRoot()
      if (merkleRootContract !== merkleRootDist) {
        console.error(
          "Contract Merkle root and last distribution doesn't match"
        )
        return
      }
    } catch (error) {
      console.error(`${error}`)
    }

    console.log("Claiming rewards:")
    console.log(`Staking provider address ${stakingProvider}`)
    console.log(`Claimer address ${claimer.address}`)
    const spinner = ora("Sending transaction...").start()

    try {
      // Call the claim method in Merkle Distribution contract
      const tx = await merkleDistContract
        .connect(claimer)
        .claim(
          stakingProvider,
          distStake.beneficiary,
          distStake.amount,
          merkleRootDist,
          distStake.proof
        )

      spinner.stopAndPersist({ symbol: "✔" })
      console.log(`https://etherscan.io/tx/${tx.hash}/`)
    } catch (error) {
      console.error("Error claiming the rewards")
      console.error(error)
    }
  }
).addParam("stakingProvider", "The staking provider address")
