const { ethers } = require("hardhat")
const { expect } = require("chai")
const { before, beforeEach, describe, it } = require("mocha")
const { MerkleTree } = require("merkletreejs")
const fc = require("fast-check")
const keccak256 = require("keccak256")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

const { genMerkleLeaf, onlyUnique, deployContractsFixture } = require("./utils")
const { dist } = require("./constants")
const { cumDist } = require("./constants")

describe("Merkle Distribution", function () {
  before(async function () {
    // numRuns must be less or equal to the number of accounts in `dist`
    const numRuns = Object.keys(dist.claims).length
    fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
  })

  describe("when deploy RewardsAggregator", async function () {
    it("should be deployed", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const {
        owner,
        rewardsHolder,
        token,
        application,
        oldMerkleDistribution,
      } = await loadFixture(deployContractsFixture)

      const rewardsAggregator = await RewardsAggregator.deploy(
        token.address,
        application.address,
        oldMerkleDistribution.address,
        rewardsHolder.address,
        owner.address
      )

      expect(await rewardsAggregator.token()).to.equal(token.address)
      expect(await rewardsAggregator.application()).to.equal(
        application.address
      )
      expect(await rewardsAggregator.rewardsHolder()).to.equal(
        rewardsHolder.address
      )
      expect(await rewardsAggregator.oldMerkleDistribution()).to.equal(
        oldMerkleDistribution.address
      )
      expect(await rewardsAggregator.owner()).to.equal(owner.address)
    })

    it("should not be possible to deploy with no token address", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, application, oldMerkleDistribution } =
        await loadFixture(deployContractsFixture)

      const tokenAddress = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          tokenAddress,
          application.address,
          oldMerkleDistribution.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.reverted
    })

    it("should not be possible to deploy with no minted tokens", async function () {
      const Token = await ethers.getContractFactory("TokenMock")
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, application, oldMerkleDistribution } =
        await loadFixture(deployContractsFixture)

      const tokenWithNoMint = await Token.deploy()

      await expect(
        RewardsAggregator.deploy(
          tokenWithNoMint.address,
          application.address,
          oldMerkleDistribution.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Token contract must be set")
    })

    it("should not be possible to deploy with no rewards holder", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, token, application, oldMerkleDistribution } =
        await loadFixture(deployContractsFixture)

      const rewardsHolder = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          oldMerkleDistribution.address,
          rewardsHolder,
          owner.address
        )
      ).to.be.revertedWith("Rewards Holder must be an address")
    })

    it("should not be possible to deploy with no application", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, token, oldMerkleDistribution } =
        await loadFixture(deployContractsFixture)

      const applicationAddress = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          applicationAddress,
          oldMerkleDistribution.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Application must be an address")
    })

    it("should not be possible to deploy with no old Merkle Distribution contract", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, token, application } = await loadFixture(
        deployContractsFixture
      )

      const fakeOldMerkleDistAddr = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          fakeOldMerkleDistAddr,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.reverted
    })

    it("should not be possible to deploy with incompatible old Merkle Distributor", async function () {
      const Token = await ethers.getContractFactory("TokenMock")
      const OldMerkleDistribution = await ethers.getContractFactory("OldMerkleDistribution")
      const RewardsAggregator = await ethers.getContractFactory("RewardsAggregator")
      const { owner, rewardsHolder, token, application } = await loadFixture(
        deployContractsFixture
      )

      const fakeToken = await Token.deploy()
      await fakeToken.mint(rewardsHolder.address, 1)
      const fakeOldMerkleDist = await OldMerkleDistribution.deploy(
        fakeToken.address,
        rewardsHolder.address,
        owner.address
      )
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          fakeOldMerkleDist.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Incompatible old Merkle Distribution contract")
    })
  })

  describe("when setting Merkle Root", async function () {
    it("should be 0 before setting it up", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const contractMerkleRoot = await rewardsAggregator.merkleRoot()
      expect(parseInt(contractMerkleRoot, 16)).to.equal(0)
    })

    it("should be possible to set a new Merkle Root", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const merkleRoot = dist.merkleRoot
      await rewardsAggregator.setMerkleRoot(merkleRoot)
      expect(await rewardsAggregator.merkleRoot()).to.equal(merkleRoot)
    })

    it("should be possible to set a second new Merkle Root", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)
      await rewardsAggregator.setMerkleRoot(cumDist.merkleRoot)
      expect(await rewardsAggregator.merkleRoot()).to.equal(cumDist.merkleRoot)
    })

    it("should be emitted an event", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const prevMerkleRoot = await rewardsAggregator.merkleRoot()
      const nextMerkleRoot = dist.merkleRoot
      const tx = rewardsAggregator.setMerkleRoot(nextMerkleRoot)
      await expect(tx)
        .to.emit(rewardsAggregator, "MerkleRootUpdated")
        .withArgs(prevMerkleRoot, nextMerkleRoot)
    })

    it("only contract's owner should can change Merkle Root", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const [, addr1] = await ethers.getSigners()
      await expect(
        rewardsAggregator.connect(addr1).setMerkleRoot(dist.merkleRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("when calling batchClaimWithoutApps", async function () {
    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = 2
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
    })

    it("should accounts get tokens", async function () {
      const { token, rewardsHolder, merkleDist, owner } = await loadFixture(
        deployContractsFixture
      )
      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.connect(owner).setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1 }),
          async function (index) {
            const claimAccounts = proofAccounts.slice(
              (proofAccounts.length / 2) * index,
              (proofAccounts.length / 2) * (index + 1)
            )
            const claimAmounts = Array.from(claimAccounts).map((claimAccount) =>
              ethers.BigNumber.from(dist.claims[claimAccount].amount)
            )
            const claimProofs = Array.from(claimAccounts).map(
              (claimAccount) => dist.claims[claimAccount].proof
            )
            const claimBeneficiaries = Array.from(claimAccounts).map(
              (claimAccount) => dist.claims[claimAccount].beneficiary
            )
            const claimStructs = Array.from(claimAccounts).map(
              (claimAccount, index) => [
                claimAccount,
                claimBeneficiaries[index],
                claimAmounts[index],
                claimProofs[index],
              ]
            )
            const prevBalances = await Promise.all(
              claimBeneficiaries.map(
                async (beneficiary) => await token.balanceOf(beneficiary)
              )
            )
            await merkleDist.batchClaimWithoutApps(merkleRoot, claimStructs)

            const afterBalancesHex = await Promise.all(
              claimBeneficiaries.map(
                async (beneficiary) => await token.balanceOf(beneficiary)
              )
            )
            const afterBalances = Array.from(afterBalancesHex).map(
              (afterAmmount) => parseInt(afterAmmount["_hex"], 16)
            )
            const additions = Object.fromEntries(
              claimBeneficiaries.filter(onlyUnique).map((i) => [i, 0])
            )
            claimBeneficiaries.forEach((beneficiary, index) => {
              additions[beneficiary] += parseInt(claimAmounts[index], 10)
            })
            const expBalances = Array.from(prevBalances).map(
              (prevAmmount, index) =>
                parseInt(prevAmmount + additions[claimBeneficiaries[index]], 10)
            )
            expBalances.forEach((expAmount, index) => {
              expect(expAmount).to.equal(afterBalances[index])
            })
          }
        )
      )
    })
  })

  // TODO: describe when calling batch claim (including apps)

  describe("when calling claimWithoutApp", async function () {
    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(dist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
    })

    it("should be emitted an event", async function () {
      const { token, rewardsHolder, merkleDist } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const claimAccount = proofAccounts[index]
            const claimAmount = ethers.BigNumber.from(
              dist.claims[claimAccount].amount
            )
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary
            const tx = merkleDist.claimWithoutApps(
              claimAccount,
              claimBeneficiary,
              claimAmount,
              merkleRoot,
              claimProof
            )
            await expect(tx)
              .to.emit(merkleDist, "Claimed")
              .withArgs(claimAccount, claimAmount, claimBeneficiary, merkleRoot)
          }
        )
      )
    })

    it("should accounts get tokens", async function () {
      const { token, rewardsHolder, merkleDist } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const claimAccount = proofAccounts[index]
            const claimAmount = ethers.BigNumber.from(
              dist.claims[claimAccount].amount
            )
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary

            const prevBalance = await token.balanceOf(claimBeneficiary)
            const expBalance = prevBalance.add(claimAmount)
            await merkleDist.claimWithoutApps(
              claimAccount,
              claimBeneficiary,
              claimAmount,
              merkleRoot,
              claimProof
            )
            const afterBalance = await token.balanceOf(claimBeneficiary)
            expect(expBalance).to.equal(afterBalance)
          }
        )
      )
    })

    it("should rewards holder to reduce its balance", async function () {
      const { rewardsHolder, merkleDist, token } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const [, rewardsHolder] = await ethers.getSigners()
            const claimAccount = proofAccounts[index]
            const claimAmount = ethers.BigNumber.from(
              dist.claims[claimAccount].amount
            )
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary

            const preBalance = await token.balanceOf(rewardsHolder.address)
            const expBalance = preBalance.sub(claimAmount)
            await merkleDist.claimWithoutApps(
              claimAccount,
              claimBeneficiary,
              claimAmount,
              merkleRoot,
              claimProof
            )
            const afterBalance = await token.balanceOf(rewardsHolder.address)
            expect(expBalance).to.equal(afterBalance)
          }
        )
      )
    })

    it("should not be possible to claim for fake accounts", async function () {
      const { rewardsHolder, merkleDist, token } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      const claimAccount = ethers.Wallet.createRandom().address
      const claimAmount = 100000
      const claimProof = [
        "0xf558bba7dd8aef6fdfb36ea106d965fd7ef483aa217cc02e2c33b78cdfb74cab",
        "0x7a8326f3dfbbddc4a0bc1e3e5005d4cecf6a7c89d386692a27dc5235b55e92cd",
      ]
      const claimBeneficiary = ethers.Wallet.createRandom().address
      await expect(
        merkleDist.claimWithoutApps(
          claimAccount,
          claimBeneficiary,
          claimAmount,
          merkleRoot,
          claimProof
        )
      ).to.be.revertedWith("Invalid proof")
    })

    it("should not be possible to claim a different amount of tokens", async function () {
      const { rewardsHolder, merkleDist, token } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          fc.integer({ min: 0, max: 10000000 }),
          async function (index, claimAmount) {
            const claimAccount = proofAccounts[index]
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary
            await expect(
              merkleDist.claimWithoutApps(
                claimAccount,
                claimBeneficiary,
                claimAmount,
                merkleRoot,
                claimProof
              )
            ).to.be.revertedWith("Invalid proof")
          }
        )
      )
    })

    it("should not be possible to claim twice", async function () {
      const { rewardsHolder, merkleDist, token } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const claimAccount = proofAccounts[index]
            const claimAmount = ethers.BigNumber.from(
              dist.claims[claimAccount].amount
            )
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary
            await merkleDist.claimWithoutApps(
              claimAccount,
              claimBeneficiary,
              claimAmount,
              merkleRoot,
              claimProof
            )
            await expect(
              merkleDist.claimWithoutApps(
                claimAccount,
                claimBeneficiary,
                claimAmount,
                merkleRoot,
                claimProof
              )
            ).to.be.revertedWith("Nothing to claim")
          }
        )
      )
    })
  })

  describe("when calling claim", async function () {
    beforeEach(async function () {})

    // For simplicity reasons, the application mock used on these tests will
    // consider that the staking provider addr is the beneficiary of the claim
  })

  describe("when set a new Merkle Distribution (cumulative)", async function () {
    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(cumDist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
    })

    it("should be possible to set a new Merkle Root after claiming (without apps)", async function () {
      const { token, rewardsHolder, merkleDist } = await loadFixture(
        deployContractsFixture
      )

      const merkleRoot = dist.merkleRoot
      const cumulativeMerkleRoot = cumDist.merkleRoot
      const totalAmount = ethers.BigNumber.from(dist.totalAmount)
      const proofAccounts = Object.keys(dist.claims)

      await token.mint(rewardsHolder.address, totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
      await merkleDist.setMerkleRoot(merkleRoot)

      const claimAccount = proofAccounts[0]
      const claimAmount = ethers.BigNumber.from(
        dist.claims[claimAccount].amount
      )
      const claimProof = dist.claims[claimAccount].proof
      const claimBeneficiary = dist.claims[claimAccount].beneficiary

      await merkleDist.claimWithoutApps(
        claimAccount,
        claimBeneficiary,
        claimAmount,
        merkleRoot,
        claimProof
      )
      await merkleDist.setMerkleRoot(cumulativeMerkleRoot)
      const contractMerkleRoot = await merkleDist.merkleRoot()
      expect(contractMerkleRoot).to.equal(cumulativeMerkleRoot)
    })

    // TODO: new test should be possible to set a new Merkle Root after claiming (WITH apps)

    it("should not be possible to claim using old Merkle Root", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)

      const merkleRoot = dist.merkleRoot
      const cumulativeMerkleRoot = cumDist.merkleRoot
      const proofAccounts = Object.keys(dist.claims)

      const claimAccount = proofAccounts[0]
      const claimAmount = ethers.BigNumber.from(
        dist.claims[claimAccount].amount
      )
      const claimProof = dist.claims[claimAccount].proof
      const claimBeneficiary = dist.claims[claimAccount].beneficiary
      await merkleDist.setMerkleRoot(cumulativeMerkleRoot)

      await expect(
        merkleDist.claimWithoutApps(
          claimAccount,
          claimBeneficiary,
          claimAmount,
          merkleRoot,
          claimProof
        )
      ).to.be.revertedWith("Merkle root was updated")
    })

    // TODO: new test should not be possible to claim (with apps) using old Merkle Root

    describe("after claiming (without apps) all tokens of the previous distribution", async function () {
      async function claimAllTokens(token, merkleDist, rewardsHolder) {
        const proofAccounts = Object.keys(dist.claims)

        await token.mint(rewardsHolder.address, dist.totalAmount)
        await token
          .connect(rewardsHolder)
          .approve(merkleDist.address, dist.totalAmount)
        await merkleDist.setMerkleRoot(dist.merkleRoot)

        for (let claimAccount of proofAccounts) {
          const claimAmount = ethers.BigNumber.from(
            dist.claims[claimAccount].amount
          )
          const claimProof = dist.claims[claimAccount].proof
          const claimBeneficiary = dist.claims[claimAccount].beneficiary
          await merkleDist.claimWithoutApps(
            claimAccount,
            claimBeneficiary,
            claimAmount,
            dist.merkleRoot,
            claimProof
          )
        }
      }

      it("should not be possible to claim (without apps) without enough balance in contract", async function () {
        const { merkleDist, token, rewardsHolder } = await loadFixture(
          deployContractsFixture
        )

        await claimAllTokens(token, merkleDist, rewardsHolder)

        const cumulativeProofAccounts = Object.keys(cumDist.claims)

        await merkleDist.setMerkleRoot(cumDist.merkleRoot)
        const claimAccount = cumulativeProofAccounts[0]
        const claimAmount = ethers.BigNumber.from(
          cumDist.claims[claimAccount].amount
        )
        const claimProof = cumDist.claims[claimAccount].proof
        const claimBeneficiary = cumDist.claims[claimAccount].beneficiary

        await expect(
          merkleDist.claimWithoutApps(
            claimAccount,
            claimBeneficiary,
            claimAmount,
            cumDist.merkleRoot,
            claimProof
          )
        ).to.be.revertedWith("Transfer amount exceeds allowance")
      })

      it("should be possible to claim (without apps) new distribution tokens", async function () {
        const { merkleDist, token, rewardsHolder } = await loadFixture(
          deployContractsFixture
        )

        await claimAllTokens(token, merkleDist, rewardsHolder)

        const cumulativeTotalAmount = ethers.BigNumber.from(cumDist.totalAmount)
        const proofAccounts = Object.keys(dist.claims)
        const cumulativeProofAccounts = Object.keys(cumDist.claims)

        await token.mint(rewardsHolder.address, cumulativeTotalAmount)
        await merkleDist.setMerkleRoot(cumDist.merkleRoot)
        await token
          .connect(rewardsHolder)
          .approve(merkleDist.address, cumulativeTotalAmount)

        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 0, max: cumulativeProofAccounts.length - 1 }),
            async function (index) {
              const claimAccount = cumulativeProofAccounts[index]
              const claimAmount = ethers.BigNumber.from(
                cumDist.claims[claimAccount].amount
              )
              const claimProof = cumDist.claims[claimAccount].proof
              const claimBeneficiary = cumDist.claims[claimAccount].beneficiary

              // add up all rewards sent to this beneificiary on previous distribution
              let prevReward = {}
              proofAccounts.forEach((account) => {
                if (dist.claims[account].beneficiary === claimBeneficiary) {
                  prevReward[account] = dist.claims[account].amount
                }
              })

              // update reward for current distribution
              prevReward[claimAccount] = claimAmount
              const reducer = (accumulator, curr) =>
                parseInt(accumulator, 10) + curr
              const totalReward = Object.values(prevReward)

              await merkleDist.claimWithoutApps(
                claimAccount,
                claimBeneficiary,
                claimAmount,
                cumDist.merkleRoot,
                claimProof
              )
              const balance = await token.balanceOf(claimBeneficiary)
              expect(totalReward.reduce(reducer)).to.equal(balance)
            }
          )
        )
      })
    })
  })

  describe("when verify Merkle Proof", async function () {
    before(async function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(dist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
    })

    // TODO: add tests that check the distributions using the past distributions
    // (distributions folders in the root of the project). Check every merkle
    // proof of every distribution to check that the new verify method in the
    // contract works as expected.

    it("should not be verified if no Merkle Proof", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await merkleDist.setMerkleRoot(dist.merkleRoot)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = []
            const verif = await merkleDist.verify(
              claimProof,
              dist.merkleRoot,
              leaf
            )
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should not be verified with incorrect Merkle Proof", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = [
              MerkleTree.bufferToHex(keccak256("proof1")),
              MerkleTree.bufferToHex(keccak256("proof2")),
            ]
            const verif = await merkleDist.verify(
              claimProof,
              dist.merkleRoot,
              leaf
            )
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should a correct MerkleProof be verified", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(
              claimProof,
              dist.merkleRoot,
              leaf
            )
            expect(verif).to.be.true
          }
        )
      )
    })

    it("should not be verified a Merkle Proof with incorrect root", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          fc.hexaString({ minLength: 64, maxLength: 64 }),
          async function (index, root) {
            root = "0x" + root
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(claimProof, root, leaf)
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should not be verified a Merkle Proof with incorrect amount", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          fc.integer({ min: 1, max: 1000000000 }),
          async function (index, amount) {
            const account = proofAccounts[index]
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(
              claimProof,
              dist.merkleRoot,
              leaf
            )
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should not be verified a Merkle Proof with incorrect account", async function () {
      const { merkleDist } = await loadFixture(deployContractsFixture)
      const proofAccounts = Object.keys(dist.claims)

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const fakeAccount = ethers.Wallet.createRandom().address
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(fakeAccount, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(
              claimProof,
              dist.merkleRoot,
              leaf
            )
            expect(verif).to.be.false
          }
        )
      )
    })
  })
})
