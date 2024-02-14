// Script that generates a new Merkle Distribution for rewards and outputs the
// data to JSON files
// Use: node src/scripts/gen_merkle_dist.js

require("dotenv").config()
const fs = require("fs")
const shell = require("shelljs")
const BigNumber = require("bignumber.js")
const ethers = require("ethers")
const { getLegacyKeepStakes } = require("./tbtcv2-rewards/tbtc-subgraph.js")
const MerkleDist = require("./merkle_dist/merkle_dist.js")
const { getTACoRewards } = require("./taco-rewards/taco-rewards.js")

// The following parameters must be modified for each distribution
const tacoWeight = 0.25
const tbtcv2Weight = 0.75
const startTime = new Date("2024-01-01T00:00:00+00:00").getTime() / 1000
const endTime = new Date("2024-02-01T00:00:00+00:00").getTime() / 1000
const lastDistribution = "2024-01-01"

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
    `--rewards-details-path ../../../${tbtcv2RewardsDetailsPath}`

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
  }

  // February 24th 2024 special case:
  // February 23rd 2024 23:59:59 UTC is the deadline to complete the transition
  // process for legacy Keep stakers.
  //
  // More info about transition period can be found:
  // https://forum.threshold.network/t/transition-guide-for-legacy-stakers/719
  //
  // During the transition period (Nov 22nd 2023 to Feb 23rd 2024), the legacy
  // Keep stakes haven't received any tBTC rewards.
  // (see https://github.com/threshold-network/merkle-distribution/issues/112).
  //
  // So, Feb 24th 2024 distribution will distribute:
  // 1. Rewards for the T tokens staked and authorized since Nov 22nd 23.
  // 2. Rewards for the keepInT that has been migrated to T staking/authorizing:
  // 2.1. In case that re-staking hasn't been completed, no keepInT rewards.
  // 2.2. In case that re-staking has been completed, it will be considered that
  //      it was staked the keepInT until re-staking time. After re-staking time,
  //      the rewards were calculated over this re-staked amount.
  //      TODO: check what happens if someone restaked a lower amount and to
  //            think about what amount to choose as basis for the rewards.

  // February 24th special case: calculate the rewards for non-legacy-stakes
  // tBTCv2 rewards calculation
  if (tbtcv2Weight > 0) {
    console.log("Calculating tBTCv2 rewards...")
    shell.exec(`cd ${tbtcv2ScriptPath} && ${tbtcv2Script}`)
    const tbtcv2RewardsRaw = JSON.parse(
      fs.readFileSync("./src/scripts/tbtcv2-rewards/rewards.json")
    )
    earnedTbtcv2Rewards = calculateTbtcv2Rewards(tbtcv2RewardsRaw, tbtcv2Weight)
  }

  // Get the legacy Keep stakes
  const blockNumber = 18624792 // Block height in which legacy stakes were deac
  const legacyStakes = await getLegacyKeepStakes(blockNumber - 1)

  // Delete the Keep legacy stakes in earned rewards
  Object.keys(legacyStakes).map((legacyStake) => {
    const legacyStakeAddress = ethers.utils.getAddress(legacyStake)
    delete earnedTbtcv2Rewards[legacyStakeAddress]
  })

  // Delete the Keep legacy stakes in rewards details file
  const rewardsDetailsPath =
    "distributions/2024-01-01/tBTCv2-rewards-details/1701993600-1704067200.json"

  const rewardsDetails = JSON.parse(fs.readFileSync(rewardsDetailsPath))

  const rewardsDetailsFiltered = rewardsDetails.filter((rewardDetail) => {
    const rewardStakingProvider = Object.keys(rewardDetail)[0].toLowerCase()
    const legacyStakesStakingProviders = Object.keys(legacyStakes)
    return !legacyStakesStakingProviders.includes(rewardStakingProvider)
  })

  fs.writeFileSync(
    rewardsDetailsPath,
    JSON.stringify(rewardsDetailsFiltered, null, 4)
  )

  // February 24th special case: calculate the rewards for Keep legacy stakes
  // TODO: calculate the rewards

  // TODO: add the keepInT rewards to tBTC rewards

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
      fs.readFileSync(`${lastDistPath}/MerkleInputPreRewards.json`)
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
