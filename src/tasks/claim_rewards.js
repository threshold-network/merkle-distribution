const { task } = require("hardhat/config")
const fs = require("fs")
const ora = require("ora")

const MERKLE_ADDRESS = "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37"

task(
  "claim-rewards",
  "Claim the accumulated staking rewards",
  async function (taskArguments, hre) {
    const { ethers } = hre

    const [claimer] = await ethers.getSigners()

    let { stakingProvider, beneficiary } = taskArguments

    if (!stakingProvider && !beneficiary) {
      console.error("Staking provider or beneficiary address must be provided")
      console.log("For usange information, run")
      console.log("  $ npx hardhat help claim-rewards")
      return
    }

    try {
      beneficiary = beneficiary ? ethers.utils.getAddress(beneficiary) : null
      stakingProvider = stakingProvider
        ? ethers.utils.getAddress(stakingProvider)
        : null
    } catch (error) {
      console.error(`Error with address provided: ${error.reason}`)
      return
    }

    let dist

    // Take the last distribution JSON
    try {
      const distsJson = JSON.parse(
        fs.readFileSync("distributions/distributions.json")
      )
      const dists = Object.keys(
        distsJson["CumulativeAmountByDistribution"]
      ).sort()
      const lastDist = dists[dists.length - 1]
      dist = JSON.parse(
        fs.readFileSync(`distributions/${lastDist}/MerkleDist.json`)
      )
    } catch (error) {
      console.error(error)
      return
    }

    const merkleRootDist = dist.merkleRoot

    let distStakes = {}

    if (beneficiary) {
      const filteredStakes = Object.entries(dist.claims).filter(
        ([, claimData]) => claimData.beneficiary === beneficiary
      )
      distStakes = Object.fromEntries(filteredStakes)
    }

    if (stakingProvider) {
      if (!dist.claims[stakingProvider]) {
        console.error(`No staking provider ${stakingProvider} found`)
        return
      }
      distStakes[stakingProvider] = dist.claims[stakingProvider]
    }

    // Transform the data to batchClaim input format
    const batchClaim = []
    Object.keys(distStakes).map((stake) => {
      const claim = {}
      claim["stakingProvider"] = stake
      claim["beneficiary"] = distStakes[stake].beneficiary
      claim["amount"] = distStakes[stake].amount
      claim["proof"] = distStakes[stake].proof
      batchClaim.push(claim)
    })

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

    console.log("Claiming rewards for stakes with staking provider:")
    Object.keys(distStakes).forEach((stake) => {
      console.log(`-- ${stake}`)
    })
    console.log(`Claimer address ${claimer.address}`)
    const spinner = ora("Sending transaction...").start()

    // Call the batchClaim method in Merkle Distribution contract
    try {
      const tx = await merkleDistContract
        .connect(claimer)
        .batchClaim(merkleRootDist, batchClaim)

      spinner.stopAndPersist({ symbol: "✔" })
      console.log(`https://etherscan.io/tx/${tx.hash}/`)
    } catch (error) {
      spinner.stopAndPersist({ symbol: "✖️" })
      console.error("Error claiming the rewards:")
      console.error(error.reason || error)
    }
  }
)
  .addOptionalParam("stakingProvider", "The staking provider address")
  .addOptionalParam("beneficiary", "The staking beneficiary address")
