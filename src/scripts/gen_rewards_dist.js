// Script that generates a new Merkle Distribution for rewards and outputs the
// data to JSON files
// Use: node src/scripts/gen_merkle_dist.js

require("dotenv").config()
const { createClient } = require("@urql/core")
const fs = require("fs")
const shell = require("shelljs")
const ethers = require("ethers")
const Subgraph = require("./pre-rewards/subgraph.js")
const Rewards = require("./pre-rewards/rewards.js")
const { getCommitmentBonus } = require("./taco-rewards/taco-rewards.js")
const MerkleDist = require("./merkle_dist/merkle_dist.js")

// The following parameters must be modified for each distribution
const preWeight = 0.25
const tbtcv2Weight = 0.75
const startTime = new Date("2023-12-08T00:00:00+00:00").getTime() / 1000
const endTime = new Date("2024-01-01T00:00:00+00:00").getTime() / 1000
const lastDistribution = "2023-12-08"

const etherscanApiKey = process.env.ETHERSCAN_TOKEN
const tbtcv2ScriptPath = "src/scripts/tbtcv2-rewards/"
const graphqlApi =
  "https://api.studio.thegraph.com/query/24143/main-threshold-subgraph/0.0.7"
const mainnetStakingSubgraphApi =
  "https://subgraph.satsuma-prod.com/276a55924ce0/nucypher--102994/mainnet-threshold-subgraph/api"

async function main() {
  if (!etherscanApiKey) {
    console.error("Error: no ETHERSCAN_TOKEN in environment variables")
    return
  }

  let earnedPreRewards = {}
  let earnedTbtcv2Rewards = {}
  let bonusRewards = {}
  let preRewards = {}
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

  const subgraphClient = createClient({ url: mainnetStakingSubgraphApi })

  // Bonus rewards calculation
  // This is a one-off Commitment bonus for Feb 1st 24 distribution. More info:
  // https://docs.threshold.network/staking-and-running-a-node/taco-node-setup/taco-authorization-and-operator-registration/one-off-commitment-bonus
  const earnedBonusRewards = await getCommitmentBonus(subgraphClient)

  // PRE rewards calculation
  if (preWeight > 0) {
    console.log("Calculating PRE rewards...")
    const preStakes = await Subgraph.getPreStakes(
      graphqlApi,
      startTime,
      endTime
    )
    earnedPreRewards = Rewards.calculatePreRewards(preStakes, preWeight)
  }

  // We need the legacy stakes to delete the Keep legacy stakes
  const blockNumber = 18624792 // Block height in which legacy stakes were deac
  const legacyStakes = await Subgraph.getLegacyKeepStakes(
    graphqlApi,
    blockNumber - 1
  )

  // tBTCv2 rewards calculation
  if (tbtcv2Weight > 0) {
    console.log("Calculating tBTCv2 rewards...")
    shell.exec(`cd ${tbtcv2ScriptPath} && ${tbtcv2Script}`)
    const tbtcv2RewardsRaw = JSON.parse(
      fs.readFileSync("./src/scripts/tbtcv2-rewards/rewards.json")
    )
    earnedTbtcv2Rewards = Rewards.calculateTbtcv2Rewards(
      tbtcv2RewardsRaw,
      tbtcv2Weight
    )
  }

  // Delete the Keep legacy stakes in earned rewards
  Object.keys(legacyStakes).map((legacyStake) => {
    const legacyStakeAddress = ethers.utils.getAddress(legacyStake)
    delete earnedTbtcv2Rewards[legacyStakeAddress]
  })

  // Delete the Keep legacy stakes in rewards details file
  const rewardsDetailsPath =
    distPath + "/tBTCv2-rewards-details/" + startTime + "-" + endTime + ".json"
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

  // Add rewards earned to cumulative totals
  try {
    bonusRewards = JSON.parse(
      fs.readFileSync(`${lastDistPath}/MerkleInputBonusRewards.json`)
    )
    bonusRewards = MerkleDist.combineMerkleInputs(
      bonusRewards,
      earnedBonusRewards
    )
    fs.writeFileSync(
      distPath + "/MerkleInputBonusRewards.json",
      JSON.stringify(bonusRewards, null, 4)
    )
    preRewards = JSON.parse(
      fs.readFileSync(`${lastDistPath}/MerkleInputPreRewards.json`)
    )
    preRewards = MerkleDist.combineMerkleInputs(preRewards, earnedPreRewards)
    fs.writeFileSync(
      distPath + "/MerkleInputPreRewards.json",
      JSON.stringify(preRewards, null, 4)
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

  let merkleInput = MerkleDist.combineMerkleInputs(bonusRewards, preRewards)
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

  console.log("Total accumulated amount of rewards: ", merkleDist.totalAmount)
}

main()
