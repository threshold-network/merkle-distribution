// Script that generates a new Merkle Distribution for rewards and outputs the
// data to JSON files
// Use: node src/scripts/gen_merkle_dist.js

require("dotenv").config()
const fs = require("fs")
const MerkleDist = require("./utils/merkle_dist.js")
const { getTACoRewards } = require("./utils/taco-rewards.js")

// The following parameters must be modified for each distribution
const tacoWeight = 0.25
const startTime = new Date("2025-03-01T00:00:00+00:00").getTime() / 1000
const endTime = new Date("2025-03-14T00:00:00+00:00").getTime() / 1000
const lastDistribution = "2025-03-01"

async function main() {
  let earnedTACoRewards = {}
  let bonusRewards = {}
  let tacoRewards = {}
  let tbtcv2Rewards = {}
  const endDate = new Date(endTime * 1000).toISOString().slice(0, 10)
  const distPath = `distributions/${endDate}`
  const distributionsFilePath = "distributions/distributions.json"
  const lastDistPath = `distributions/${lastDistribution}`

  try {
    fs.mkdirSync(distPath)
  } catch (err) {
    console.error(err)
    return
  }

  // TACo rewards calculation
  if (tacoWeight > 0) {
    earnedTACoRewards = await getTACoRewards(startTime, endTime, tacoWeight)
    console.log("TACo rewards earned:", earnedTACoRewards)
  }

  // Add rewards earned to cumulative totals
  try {
    bonusRewards = JSON.parse(
      fs.readFileSync(`${lastDistPath}/MerkleInputBonusRewards.json`)
    )
    fs.writeFileSync(
      distPath + "/MerkleInputBonusRewards.json",
      JSON.stringify(bonusRewards, null, 4)
    )
    tacoRewards = JSON.parse(
      fs.readFileSync(`${lastDistPath}/MerkleInputTACoRewards.json`)
    )
    tacoRewards = MerkleDist.combineMerkleInputs(tacoRewards, earnedTACoRewards)
    fs.writeFileSync(
      distPath + "/MerkleInputTACoRewards.json",
      JSON.stringify(tacoRewards, null, 4)
    )
    tbtcv2Rewards = JSON.parse(
      fs.readFileSync(`${lastDistPath}/MerkleInputTbtcv2Rewards.json`)
    )
    fs.writeFileSync(
      distPath + "/MerkleInputTbtcv2Rewards.json",
      JSON.stringify(tbtcv2Rewards, null, 4)
    )
  } catch (err) {
    console.error(err)
    return
  }

  let merkleInput = MerkleDist.combineMerkleInputs(bonusRewards, tacoRewards)
  merkleInput = MerkleDist.combineMerkleInputs(merkleInput, tbtcv2Rewards)

  // Generate the Merkle distribution
  const merkleDist = MerkleDist.genMerkleDist(merkleInput)

  // Write the Merkle distribution to JSON file
  try {
    fs.writeFileSync(
      distPath + "/MerkleInputTotalRewards.json",
      JSON.stringify(merkleInput, null, 4)
    )
    fs.writeFileSync(
      distPath + "/MerkleDist.json",
      JSON.stringify(merkleDist, null, 4)
    )
  } catch (err) {
    console.error(err)
    return
  }

  // Write the total amount in distributions JSON file
  const distributions = JSON.parse(fs.readFileSync(distributionsFilePath))
  distributions.LatestCumulativeAmount = merkleDist.totalAmount
  distributions.CumulativeAmountByDistribution[endDate] = merkleDist.totalAmount
  fs.writeFileSync(
    distributionsFilePath,
    JSON.stringify(distributions, null, 4)
  )
}

main()
