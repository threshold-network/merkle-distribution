// Check if the TACo rewards calculated on the last distribution present in the
// distributions folder are correct.
// Note that this test requires a JSON file with a list of stakes to check.

const { expect } = require("chai")
const fs = require("fs")

describe("Checking last TACo rewards distribution", () => {
  const distFolders = fs.readdirSync("./distributions/")
  // The last element is `distribution.json`, so we need the second last
  const lastDistFolder = distFolders[distFolders.length - 2]
  // const penultimateDistFolder = distFolders[distFolders.length - 3]

  it("should include the necessary files", () => {
    const merkleFiles = fs.readdirSync(`./distributions/${lastDistFolder}`)
    expect(merkleFiles).include("MerkleInputBonusRewards.json")
    expect(merkleFiles).include("MerkleInputTbtcv2Rewards.json")
    expect(merkleFiles).include("MerkleInputTACoRewards.json")
    expect(merkleFiles).include("MerkleInputTotalRewards.json")
    expect(merkleFiles).include("MerkleDist.json")

    const detailsFiles = fs.readdirSync(
      `./distributions/${lastDistFolder}/TACoRewardsDetails`
    )
    expect(detailsFiles).include("EarnedRewards.json")
    expect(detailsFiles).include("HeartbeatRituals.json")
    expect(detailsFiles).include("NodesFailures.json")
    expect(detailsFiles).include("PotentialRewards.json")
  })

  it("should generated rewards correctly added to previous", () => {
    // const earnedRewards =
    // TODO: check if bonus files are the same
    // TODO: check if tbtcv2 files are the same
    // TODO: sum the stakes earned rewards one by one,
    // and sum to the previous distribution merkle dist.
    // This should be the same as the merkle input taco rewards.
    // Also this should be the same as the merkle dist of this distribution.
    // TODO: check if the sum of the previous Merkle dist and the earned rewards is correct.
    // TODO: check if the sum of all the inputs is the same that the merkle dist.
    // TODO: check if distributions.json has the correct amount
  })
  it("should known stakes receive expected rewards", () => {})
  it("should infractors be penalized", () => {})
  it("should beta stakers not receive rewards", () => {})
})
