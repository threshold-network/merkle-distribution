// Script that generates a new Merkle Distribution for rewards and outputs the
// data to JSON files
// Use: node src/scripts/gen_merkle_dist.js

require("dotenv").config()
const fs = require("fs")
const MerkleDist = require("./utils/merkle_dist.js")
const {
  getPotentialRewards,
  getHeartbeatNodesFailures,
  setBetaStakerRewardsToZero,
  applyPenalties,
} = require("./utils/taco-rewards.js")

// The following parameters must be modified for each distribution
const tacoWeight = 0.25
const startTime = new Date("2025-05-01T00:00:00+00:00").getTime() / 1000
const endTime = new Date("2025-06-01T00:00:00+00:00").getTime() / 1000
const lastDistribution = "2025-05-01"

async function main() {
  const endDate = new Date(endTime * 1000).toISOString().slice(0, 10)
  const distPath = `distributions/${endDate}`
  const tacoRewardsDetailsPath = `${distPath}/TACoRewardsDetails`
  const heartbeatRitualsPath = "heartbeat-rituals.json"
  const lastDistPath = `distributions/${lastDistribution}`
  const distributionsFilePath = "distributions/distributions.json"

  let earnedTACoRewards = {}

  // TACo rewards calculation
  if (tacoWeight > 0) {
    // Create the folder for TACo rewards details
    try {
      fs.mkdirSync(tacoRewardsDetailsPath, { recursive: true })
    } catch (err) {
      console.error(err)
      return
    }

    // Potential TACo rewards before applying penalties
    console.log("Calculating potential TACo rewards...")
    let potentialTACoRewards = await getPotentialRewards(
      startTime,
      endTime,
      tacoWeight
    )

    // Make sure that TACo rewards for Beta Stakers are set to zero
    potentialTACoRewards = setBetaStakerRewardsToZero(potentialTACoRewards)

    writeDataToFile(
      `${tacoRewardsDetailsPath}/PotentialRewards.json`,
      potentialTACoRewards
    )

    // Read and copy the list of DKG heartbeats for this distribution
    const heartbeatRituals = readDataFromFile(heartbeatRitualsPath)
    writeDataToFile(
      `${tacoRewardsDetailsPath}/HeartbeatRituals.json`,
      heartbeatRituals
    )

    // Get the list of nodes that didn't complete some DKG ritual
    console.log("Retrieving node failures on DKG heartbeats...")
    let failedHeartbeats
    try {
      failedHeartbeats = await getHeartbeatNodesFailures(heartbeatRituals)
    } catch (err) {
      console.error("Error in TACo penalty calculation:", err)
      return
    }
    writeDataToFile(
      `${tacoRewardsDetailsPath}/NodesFailures.json`,
      failedHeartbeats
    )

    // Apply penalties to TACo rewards
    console.log("Applying penalties to TACo rewards...")
    earnedTACoRewards = applyPenalties(potentialTACoRewards, failedHeartbeats)
    writeDataToFile(
      `${tacoRewardsDetailsPath}/EarnedRewards.json`,
      earnedTACoRewards
    )
  }

  // Add rewards earned to accumulated totals
  // Bonus rewards remain the same
  const bonusRewards = readDataFromFile(
    `${lastDistPath}/MerkleInputBonusRewards.json`
  )
  writeDataToFile(`${distPath}/MerkleInputBonusRewards.json`, bonusRewards)

  // tBTCv2 rewards remain the same
  const tbtcv2Rewards = readDataFromFile(
    `${lastDistPath}/MerkleInputTbtcv2Rewards.json`
  )
  writeDataToFile(`${distPath}/MerkleInputTbtcv2Rewards.json`, tbtcv2Rewards)

  // Combine the accumulated TACo rewards with the new rewards
  const prevAccumulatedRewards = readDataFromFile(
    `${lastDistPath}/MerkleInputTACoRewards.json`
  )

  const tacoRewards = MerkleDist.combineMerkleInputs(
    prevAccumulatedRewards,
    earnedTACoRewards
  )

  writeDataToFile(`${distPath}/MerkleInputTACoRewards.json`, tacoRewards)

  let merkleInput = MerkleDist.combineMerkleInputs(bonusRewards, tbtcv2Rewards)
  merkleInput = MerkleDist.combineMerkleInputs(merkleInput, tacoRewards)
  writeDataToFile(`${distPath}/MerkleInputTotalRewards.json`, merkleInput)

  // Generate the Merkle distribution
  const merkleDist = MerkleDist.genMerkleDist(merkleInput)
  writeDataToFile(`${distPath}/MerkleDist.json`, merkleDist)

  // Write the total amount in distributions JSON file
  const distributions = readDataFromFile(distributionsFilePath)
  distributions.LatestCumulativeAmount = merkleDist.totalAmount
  distributions.CumulativeAmountByDistribution[endDate] = merkleDist.totalAmount
  writeDataToFile(distributionsFilePath, distributions)
}

function readDataFromFile(path) {
  // Read the list of heartbeat rituals
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (err) {
    console.error(`Error reading data from file: ${path}`)
    console.error(err)
    return
  }
}

function writeDataToFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 4))
  } catch (err) {
    console.error(`Error writing data to file: ${path}`)
    console.error(err)
  }
}

main()
