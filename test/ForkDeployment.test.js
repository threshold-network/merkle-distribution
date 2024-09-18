const { getNamedAccounts, network, ethers } = require("hardhat")
const { before, describe, it } = require("mocha")
const { expect } = require("chai")

describe("Deployment of RewardsAggregator using mainnet network fork", function () {
  before(function (done) {
    if ((network.config.forking && network.config.forking.enabled) !== true) {
      done(
        new Error("Ethereum mainnet not being forked. FORKING_URL env var set?")
      )
    } else {
      done()
    }
  })

  it("should be deployed RewardsAggregator", async function () {
    const {
      tokenContract,
      tacoApp,
      oldCumulativeMerkleDrop,
      merkleRewardsHolder,
      owner,
    } = await getNamedAccounts()

    const RewardsAggregator = await ethers.getContractFactory(
      "RewardsAggregator"
    )

    const rewardsAggregator = await RewardsAggregator.deploy(
      tokenContract,
      tacoApp,
      oldCumulativeMerkleDrop,
      merkleRewardsHolder,
      owner
    )

    // Check if the contract was successfully deployed
    expect(await rewardsAggregator.owner()).to.equal(owner)
    expect(await rewardsAggregator.token()).to.equal(tokenContract)
    expect(await rewardsAggregator.application()).to.equal(tacoApp)
    expect(await rewardsAggregator.merkleRewardsHolder()).to.equal(
      merkleRewardsHolder
    )
    expect(await rewardsAggregator.oldCumulativeMerkleDrop()).to.equal(
      oldCumulativeMerkleDrop
    )

    // Check if it is possible to claim Merkle rewards
    // TODO: It is needed to allow RewardsAggregator to pull tokens from ClaimableRewards

    // TODO: test a TACoApp claim

    // TODO: test a total claim (Merkle + TACoApp)

  })
})
