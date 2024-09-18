const { getNamedAccounts, network, ethers } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { before, describe, it } = require("mocha")
const { expect } = require("chai")

const { getLastMerkleClaim } = require("./utils")

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

    // This staking prov is going to be used for tests. It has merkle-claimed
    // in the past and also it has remaining tokens to merkle-claim
    const stakingProv = "0x0154C52ec5b6a3010758dDe78079589E67526767"
    const claim = getLastMerkleClaim(stakingProv)

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

    const ownerSigner = await ethers.getSigner(owner)

    await helpers.setBalance(owner, 10n ** 18n)
    await rewardsAggregator.connect(ownerSigner).setMerkleRoot(claim.merkleRoot)

    // Check if the contract was successfully deployed
    expect(await rewardsAggregator.owner()).to.equal(owner)
    expect(await rewardsAggregator.token()).to.equal(tokenContract)
    expect(await rewardsAggregator.application()).to.equal(tacoApp)
    expect(await rewardsAggregator.merkleRoot()).to.equal(claim.merkleRoot)
    expect(await rewardsAggregator.merkleRewardsHolder()).to.equal(
      merkleRewardsHolder
    )
    expect(await rewardsAggregator.oldCumulativeMerkleDrop()).to.equal(
      oldCumulativeMerkleDrop
    )

    const claimed = await rewardsAggregator.cumulativeMerkleClaimed(stakingProv)
    expect(claimed).to.be.greaterThan(ethers.BigNumber.from(0))

    // Check if it is possible to claim Merkle rewards
    // const prevBalance = await
    const toBeClaimed = ethers.BigNumber.from(claim.amount).sub(claimed)

    await rewardsAggregator.claimMerkle(stakingProv, claim.beneficiary, claim.amount, claim.merkleRoot, claim.proof)

    console.log(toBeClaimed)
    // TODO: can I make a new claim?
    // TODO: It is needed to allow RewardsAggregator to pull tokens from ClaimableRewards

    // TODO: test a TACoApp claim

    // TODO: test a total claim (Merkle + TACoApp)
  })
})
