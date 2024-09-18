const { deployments, getNamedAccounts, network } = require("hardhat")
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

  it("test", async function () {
    const { deploy } = deployments

    const {
      deployer,
      tokenContract,
      tacoApp,
      oldCumulativeMerkleDrop,
      merkleRewardsHolder,
      owner,
    } = await getNamedAccounts()

    const args = [
      tokenContract,
      tacoApp,
      oldCumulativeMerkleDrop,
      merkleRewardsHolder,
      owner,
    ]

    const rewardsAggregator = await deploy("RewardsAggregator", {
      from: deployer,
      args,
    })

    console.log(rewardsAggregator.address)
  })
})
