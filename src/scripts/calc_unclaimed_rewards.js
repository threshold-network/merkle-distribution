// Script that calculates the rewards that has not been claimed yet by every
// staker and generates a report with it
// Use: node src/scripts/calc_unclaimed_rewards.js

const fs = require("fs")
const { BigNumber } = require("bignumber.js")
const { ethers } = require("ethers")

require("dotenv").config()

// MODIFY THIS WITH THE LAST DISTRIBUTION IN WHICH FUNDS WERE TRANSFERRED FROM
// FUTURE REWARDS TO CLAIMABE REWARDS
const distribution = "./distributions/2025-09-01/MerkleDist.json"

const MERKLE_DIST_ADDRESS = "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37"
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL

async function main() {
  if (!ETHEREUM_RPC_URL) {
    throw "Env variable for Ethereum RPC URL not set"
  }

  const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL)

  const merkleDistDeployment = fs.readFileSync(
    "deployments/mainnet/CumulativeMerkleDrop.json"
  )
  const merkleDistAbi = JSON.parse(merkleDistDeployment).abi

  const contract = new ethers.Contract(
    MERKLE_DIST_ADDRESS,
    merkleDistAbi,
    provider
  )

  const lastDist = JSON.parse(fs.readFileSync(distribution))

  const report = {}

  const claims = lastDist.claims
  for (const address of Object.keys(claims)) {
    console.log(`🧐  ${address}`)

    const earned = BigNumber(claims[address].amount)
    let claimed = await contract.cumulativeClaimed(address)
    claimed = BigNumber(claimed.toString())
    const notClaimed = earned.minus(claimed)
    report[address] = {
      earnedRewards: earned.toFixed(),
      claimedRewards: claimed.toFixed(),
      notClaimedRewards: notClaimed.toFixed(),
    }
  }

  fs.writeFileSync(
    "remaining_rewards_report.json",
    JSON.stringify(report, null, 2)
  )

  const totalNotClaimed = Object.keys(report).reduce((acc, address) => {
    return acc.plus(BigNumber(report[address].notClaimedRewards))
  }, BigNumber(0))

  const totalClaimed = Object.keys(report).reduce((acc, address) => {
    return acc.plus(BigNumber(report[address].claimedRewards))
  }, BigNumber(0))

  const totalEarned = Object.keys(report).reduce((acc, address) => {
    return acc.plus(BigNumber(report[address].earnedRewards))
  }, BigNumber(0))

  console.log("Total amount of rewards claimed:", totalClaimed.toFixed())
  console.log("Total amount of rewards NOT claimed:", totalNotClaimed.toFixed())
  console.log("Total amount of rewards earned:", totalEarned.toFixed())
}

main()
