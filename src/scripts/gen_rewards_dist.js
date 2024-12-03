// Script that generates a new Merkle Distribution for rewards and outputs the
// data to JSON files
// Use: node src/scripts/gen_merkle_dist.js

require("dotenv").config()
const fs = require("fs")
const shell = require("shelljs")
const BigNumber = require("bignumber.js")
const MerkleDist = require("./utils/merkle_dist.js")
const { getTACoRewards } = require("./utils/taco-rewards.js")

// The following parameters must be modified for each distribution
const tacoWeight = 0.25
const tbtcv2Weight = 0.75
const startTime = new Date("2024-11-01T00:00:00+00:00").getTime() / 1000
const endTime = new Date("2024-12-01T00:00:00+00:00").getTime() / 1000
const lastDistribution = "2024-11-01"
// tBTC valid versions and deadlines (if any) sorted from latests to oldest.
// Example: v2.1.x is the current version, v2.0.x is valid until 2024-06-01:
// v2.1.0|v2.0.0_1717200000
// Note that we only care about major and minor versions, so not updating to a
// new patch version will not disqualify the stake for rewards.
const tbtcValidVersions = "v2.1.0"

const etherscanApiKey = process.env.ETHERSCAN_TOKEN
const tbtcv2ScriptPath = "src/scripts/tbtcv2-rewards/"

async function main() {
  if (!etherscanApiKey) {
    console.error("Error: no ETHERSCAN_TOKEN in environment variables")
    return
  }

  let earnedTACoRewards = {}
  let earnedTbtcv2Rewards = {}
  let bonusRewards = {}
  let tacoRewards = {}
  let tbtcv2Rewards = {}
  const endDate = new Date(endTime * 1000).toISOString().slice(0, 10)
  const distPath = `distributions/${endDate}`
  const distributionsFilePath = "distributions/distributions.json"
  const tbtcv2RewardsDetailsPath = `${distPath}/tBTCv2-rewards-details/`
  const lastDistPath = `distributions/${lastDistribution}`
  const tbtcv2Script =
    "./rewards.sh " +
    `--rewards-start-date ${startTime} ` +
    `--rewards-end-date ${endTime} ` +
    `--etherscan-token ${etherscanApiKey} ` +
    `--rewards-details-path ../../../${tbtcv2RewardsDetailsPath} ` +
    `--valid-versions "${tbtcValidVersions}"`

  try {
    fs.mkdirSync(distPath)
    fs.mkdirSync(tbtcv2RewardsDetailsPath)
  } catch (err) {
    console.error(err)
    return
  }

  // TACo rewards calculation
  if (tacoWeight > 0) {
    earnedTACoRewards = await getTACoRewards(startTime, endTime, tacoWeight)
    console.log("TACo rewards earned:", earnedTACoRewards)
  }

  // tBTCv2 rewards calculation
  if (tbtcv2Weight > 0) {
    console.log("Calculating tBTCv2 rewards...")
    shell.exec(`cd ${tbtcv2ScriptPath} && ${tbtcv2Script}`)
    const tbtcv2RewardsRaw = JSON.parse(
      fs.readFileSync("./src/scripts/tbtcv2-rewards/rewards.json")
    )
    earnedTbtcv2Rewards = calculateTbtcv2Rewards(tbtcv2RewardsRaw, tbtcv2Weight)
    console.log("tBTCv2 rewards earned:", earnedTbtcv2Rewards)
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
    if (fs.existsSync(`${lastDistPath}/MerkleInputTbtcv2Rewards.json`)) {
      tbtcv2Rewards = JSON.parse(
        fs.readFileSync(`${lastDistPath}/MerkleInputTbtcv2Rewards.json`)
      )
    } else {
      tbtcv2Rewards = {}
    }
    tbtcv2Rewards = MerkleDist.combineMerkleInputs(
      tbtcv2Rewards,
      earnedTbtcv2Rewards
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

//
// Calculate the tBTCv2 weighted rewards earned by each stake
//
function calculateTbtcv2Rewards(stakes, weight) {
  Object.keys(stakes).map((stakingProvider) => {
    const amount = BigNumber(stakes[stakingProvider].amount)
    const weightedReward = amount.times(weight)
    stakes[stakingProvider].amount = weightedReward.toFixed(0)
  })
  return stakes
}

main()
