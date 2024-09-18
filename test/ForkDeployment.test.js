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
      tokenContract: tokenAddr,
      tacoApp: tacoAppAddr,
      oldCumulativeMerkleDrop: oldCumulativeMerkleDropAddr,
      merkleRewardsHolder: merkleRewardsHolderAddr,
      owner: ownerAddr,
    } = await getNamedAccounts()

    // This staking prov is going to be used for tests. It has merkle-claimed
    // in the past and also it has remaining tokens to merkle-claim
    const stakingProv = "0x0154C52ec5b6a3010758dDe78079589E67526767"
    const claim = getLastMerkleClaim(stakingProv)

    const tokenContract = await ethers.getContractAt("TokenMock", tokenAddr)

    const RewardsAggregator = await ethers.getContractFactory(
      "RewardsAggregator"
    )
    // Step1: deployment of the contract
    const rewardsAggregator = await RewardsAggregator.deploy(
      tokenAddr,
      tacoAppAddr,
      oldCumulativeMerkleDropAddr,
      merkleRewardsHolderAddr,
      ownerAddr
    )

    const ownerSigner = await ethers.getSigner(ownerAddr)
    const merkleRewardsHolderSigner = await ethers.getSigner(
      merkleRewardsHolderAddr
    )

    await helpers.setBalance(ownerAddr, 10n ** 18n)
    await helpers.setBalance(merkleRewardsHolderAddr, 10n ** 18n)
    // Step2: set the Merkle root
    await rewardsAggregator.connect(ownerSigner).setMerkleRoot(claim.merkleRoot)

    // Step3: set ClaimableRewards contract allowance so RewardsAggregator can
    // pull tokens and to push them to the stake beneficiary. The old Merkle
    // contract allowance must be set to 0 and the same amount must be set in
    // the new RewardsAggregator contract.
    // await tokenContract.connect(merkleRewardsHolder)
    await tokenContract
      .connect(merkleRewardsHolderSigner)
      .approve(rewardsAggregator.address, 1000000n * 10n ** 18n)

    // Check if the contract was successfully deployed
    expect(await rewardsAggregator.owner()).to.equal(ownerAddr)
    expect(await rewardsAggregator.token()).to.equal(tokenAddr)
    expect(await rewardsAggregator.application()).to.equal(tacoAppAddr)
    expect(await rewardsAggregator.merkleRoot()).to.equal(claim.merkleRoot)
    expect(await rewardsAggregator.merkleRewardsHolder()).to.equal(
      merkleRewardsHolderAddr
    )
    expect(await rewardsAggregator.oldCumulativeMerkleDrop()).to.equal(
      oldCumulativeMerkleDropAddr
    )

    const claimed = await rewardsAggregator.cumulativeMerkleClaimed(stakingProv)
    expect(claimed).to.be.greaterThan(ethers.BigNumber.from(0))

    // Check if it is possible to claim Merkle rewards
    const prevBalance = await tokenContract.balanceOf(claim.beneficiary)
    const toBeClaimed = ethers.BigNumber.from(claim.amount).sub(claimed)
    const expectedBalance = prevBalance.add(toBeClaimed)

    await rewardsAggregator.claimMerkle(
      stakingProv,
      claim.beneficiary,
      claim.amount,
      claim.merkleRoot,
      claim.proof
    )

    expect(expectedBalance).to.equal(
      await tokenContract.balanceOf(claim.beneficiary)
    )

    // should not be possible to get the same Merkle claim twice
    await expect(
      rewardsAggregator.claimMerkle(
        stakingProv,
        claim.beneficiary,
        claim.amount,
        claim.merkleRoot,
        claim.proof
      )
    ).to.be.revertedWith("Nothing to claim")

    // TODO: It is needed to allow RewardsAggregator to pull tokens from ClaimableRewards

    // TODO: test a TACoApp claim

    // TODO: test a total claim (Merkle + TACoApp)
  })
})
