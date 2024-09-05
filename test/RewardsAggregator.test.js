const fs = require("fs")
const { ethers } = require("hardhat")
const { expect } = require("chai")
const { describe, it } = require("mocha")
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

const { genMerkleLeaf, deployContractsFixture } = require("./utils")
const { dist } = require("./constants")
const { cumDist } = require("./constants")

describe("Rewards Aggregator contract", function () {
  describe("when deploying RewardsAggregator", async function () {
    it("should be deployed", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const {
        owner,
        rewardsHolder,
        token,
        application,
        oldCumulativeMerkleDrop,
      } = await loadFixture(deployContractsFixture)

      const rewardsAggregator = await RewardsAggregator.deploy(
        token.address,
        application.address,
        oldCumulativeMerkleDrop.address,
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
      expect(await rewardsAggregator.oldCumulativeMerkleDrop()).to.equal(
        oldCumulativeMerkleDrop.address
      )
      expect(await rewardsAggregator.owner()).to.equal(owner.address)
    })

    it("should not be possible to deploy with no token address", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, application, oldCumulativeMerkleDrop } =
        await loadFixture(deployContractsFixture)

      const tokenAddress = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          tokenAddress,
          application.address,
          oldCumulativeMerkleDrop.address,
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
      const { owner, rewardsHolder, application, oldCumulativeMerkleDrop } =
        await loadFixture(deployContractsFixture)

      const tokenWithNoMint = await Token.deploy()

      await expect(
        RewardsAggregator.deploy(
          tokenWithNoMint.address,
          application.address,
          oldCumulativeMerkleDrop.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Token contract must be set")
    })

    it("should not be possible to deploy with no rewards holder", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, token, application, oldCumulativeMerkleDrop } =
        await loadFixture(deployContractsFixture)

      const rewardsHolder = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          oldCumulativeMerkleDrop.address,
          rewardsHolder,
          owner.address
        )
      ).to.be.revertedWith("Rewards Holder must be an address")
    })

    it("should not be possible to deploy with no application", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, token, oldCumulativeMerkleDrop } =
        await loadFixture(deployContractsFixture)

      const applicationAddress = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          applicationAddress,
          oldCumulativeMerkleDrop.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Application must be an address")
    })

    it("should not be possible to deploy with no old Merkle contract", async function () {
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, token, application } = await loadFixture(
        deployContractsFixture
      )

      const fakeOldCumulativeMerkleContractAddr = ethers.constants.AddressZero
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          fakeOldCumulativeMerkleContractAddr,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.reverted
    })

    it("should not be possible to deploy with incompatible old Merkle contract", async function () {
      const Token = await ethers.getContractFactory("TokenMock")
      const CumulativeMerkleDrop = await ethers.getContractFactory(
        "CumulativeMerkleDrop"
      )
      const RewardsAggregator = await ethers.getContractFactory(
        "RewardsAggregator"
      )
      const { owner, rewardsHolder, token, application } = await loadFixture(
        deployContractsFixture
      )

      const fakeToken = await Token.deploy()
      await fakeToken.mint(rewardsHolder.address, 1)
      const fakeOldCumulativeMerkleDrop = await CumulativeMerkleDrop.deploy(
        fakeToken.address,
        rewardsHolder.address,
        owner.address
      )
      await expect(
        RewardsAggregator.deploy(
          token.address,
          application.address,
          fakeOldCumulativeMerkleDrop.address,
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
      const [, signer1] = await ethers.getSigners()
      await expect(
        rewardsAggregator.connect(signer1).setMerkleRoot(dist.merkleRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("when setting Rewards Holder", async function () {
    it("should be possible to set a new Rewards Holder address", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const rewardsHolder = "0xF8653523beEB1799516f0BBB56B72a3F236176B5"
      await rewardsAggregator.setRewardsHolder(rewardsHolder)
      expect(await rewardsAggregator.rewardsHolder()).to.equal(rewardsHolder)
    })

    it("should not be possible to set an invalid address", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const rewardsHolder = ethers.constants.AddressZero
      await expect(
        rewardsAggregator.setRewardsHolder(rewardsHolder)
      ).to.be.revertedWith("Rewards Holder must be an address")
    })

    it("should be emitted an event", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const prevRewardsHolder = await rewardsAggregator.rewardsHolder()
      const newRewardsHolder = "0xF8653523beEB1799516f0BBB56B72a3F236176B5"
      const tx = rewardsAggregator.setRewardsHolder(newRewardsHolder)
      await expect(tx)
        .to.emit(rewardsAggregator, "RewardsHolderUpdated")
        .withArgs(prevRewardsHolder, newRewardsHolder)
    })

    it("only contract's owner should can change Rewards Holder", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const newRewardsHolder = "0xF8653523beEB1799516f0BBB56B72a3F236176B5"
      const [, , , , , signer1] = await ethers.getSigners()
      await expect(
        rewardsAggregator.connect(signer1).setRewardsHolder(newRewardsHolder)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("when verifying a Merkle Proof", async function () {
    it("should be verified if Merkle proof is correct", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        const beneficiary = dist.claims[stakingProvider].beneficiary
        const amount = dist.claims[stakingProvider].amount
        const claimProof = dist.claims[stakingProvider].proof
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.true
      }
    })

    it("should not be verified if no Merkle Proof", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        const beneficiary = dist.claims[stakingProvider].beneficiary
        const amount = dist.claims[stakingProvider].amount
        // No claim proof
        const claimProof = []
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should not be verified with incorrect Merkle Proof", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        const beneficiary = dist.claims[stakingProvider].beneficiary
        const amount = dist.claims[stakingProvider].amount
        // Fake claim proof
        const claimProof = [
          MerkleTree.bufferToHex(keccak256("proof1")),
          MerkleTree.bufferToHex(keccak256("proof2")),
        ]
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should not be verified a Merkle Proof with incorrect root", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        const beneficiary = dist.claims[stakingProvider].beneficiary
        const amount = dist.claims[stakingProvider].amount
        const claimProof = dist.claims[stakingProvider].proof
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        // Fake Merkle root
        const merkleRoot = "0x" + "f".repeat(64)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should not be verified a Merkle Proof with incorrect amount", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        const beneficiary = dist.claims[stakingProvider].beneficiary
        // Fake amount
        const amount = dist.claims[stakingProvider].amount + 1
        const claimProof = dist.claims[stakingProvider].proof
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should not be verified a Merkle Proof with incorrect beneficiary", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        // Fake beneficiary
        const beneficiary = "0xF8653523beEB1799516f0BBB56B72a3F236176B5"
        const amount = dist.claims[stakingProvider].amount
        const claimProof = dist.claims[stakingProvider].proof
        const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should not be verified a Merkle Proof with incorrect staking provider", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProviders = Object.keys(dist.claims)

      for (let stakingProvider of stakingProviders) {
        // Fake staking provider
        const fakeStakingProvider = "0xF8653523beEB1799516f0BBB56B72a3F236176B5"
        const beneficiary = dist.claims[stakingProvider].beneficiary
        const amount = dist.claims[stakingProvider].amount + 1
        const claimProof = dist.claims[stakingProvider].proof
        const leaf = genMerkleLeaf(fakeStakingProvider, beneficiary, amount)
        const verif = await rewardsAggregator.verifyMerkleProof(
          claimProof,
          dist.merkleRoot,
          leaf
        )
        expect(verif).to.be.false
      }
    })

    it("should be verified the past distributions", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)

      // Read the dists folders and take only those with YYYY/MM/DD format
      let distDates = fs
        .readdirSync("./distributions")
        .filter((dist) => /^\d{4}-\d{2}-\d{2}$/.test(dist))

      // Taking only the first distribution because it takes too much time to
      // run the tests for all the dists. Comment out this line for full test
      distDates = [distDates[0]]

      for (let distDate of distDates) {
        const data = fs.readFileSync(
          `./distributions/${distDate}/MerkleDist.json`
        )
        const dist = JSON.parse(data)
        const stakingProviders = Object.keys(dist.claims)

        for (let stakingProvider of stakingProviders) {
          const beneficiary = dist.claims[stakingProvider].beneficiary
          const amount = dist.claims[stakingProvider].amount
          const claimProof = dist.claims[stakingProvider].proof
          const leaf = genMerkleLeaf(stakingProvider, beneficiary, amount)
          const verif = await rewardsAggregator.verifyMerkleProof(
            claimProof,
            dist.merkleRoot,
            leaf
          )
          expect(verif).to.be.true
        }
      }
    })
  })

  describe("when claiming rewards generated by Merkle distribution", async function () {
    it("should not be possible to claim if no Merkle Root is set", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      await expect(
        rewardsAggregator.claimMerkle(
          stakingProvider,
          beneficiary,
          amount,
          dist.merkleRoot,
          proof
        )
      ).to.be.revertedWith("Merkle root was updated")
    })
    it("should not be possible to claim if Merkle Root is not correct", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)

      const fakeMerkleRoot = "0x" + "f".repeat(64)
      await rewardsAggregator.setMerkleRoot(fakeMerkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      await expect(
        rewardsAggregator.claimMerkle(
          stakingProvider,
          beneficiary,
          amount,
          dist.merkleRoot,
          proof
        )
      ).to.be.revertedWith("Merkle root was updated")
    })
    it("should not be possible to claim if Merkle Proof is not correct", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const fakeProof = ["0x" + "f".repeat(64), "0x" + "f".repeat(64)]

      await expect(
        rewardsAggregator.claimMerkle(
          stakingProvider,
          beneficiary,
          amount,
          dist.merkleRoot,
          fakeProof
        )
      ).to.be.revertedWith("Invalid proof")
    })

    it("should not be possible to claim a different amount of tokens", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      await expect(
        rewardsAggregator.claimMerkle(
          stakingProvider,
          beneficiary,
          amount + 1, // Claiming 1 more token
          dist.merkleRoot,
          proof
        )
      ).to.be.revertedWith("Invalid proof")
    })

    it("should be possible to claim", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      const prevBalance = await token.balanceOf(beneficiary)
      await rewardsAggregator.claimMerkle(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )
      const afterBalance = await token.balanceOf(beneficiary)

      expect(afterBalance).to.equal(prevBalance.add(amount))
    })
    it("should be taken into account the rewards already claimed in old Merkle contract", async function () {
      const {
        token,
        rewardsHolder,
        oldCumulativeMerkleDrop,
        rewardsAggregator,
      } = await loadFixture(deployContractsFixture)
      await token.mint(rewardsHolder.address, cumDist.totalAmount)

      // There are two example distributions: dist & cumDist. The second one
      // increases the rewards of some of the first one's beneficiaries
      await token
        .connect(rewardsHolder)
        .approve(oldCumulativeMerkleDrop.address, cumDist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, cumDist.totalAmount)

      const stakingProvider = Object.keys(dist.claims)[0]

      // Setting the Merkle root of the first dist in the old Merkle contract
      await oldCumulativeMerkleDrop.setMerkleRoot(dist.merkleRoot)

      // Claiming the rewards of the first dist in the old Merkle contract
      let prevBalance = await token.balanceOf(
        dist.claims[stakingProvider].beneficiary
      )
      await oldCumulativeMerkleDrop.claim(
        stakingProvider,
        dist.claims[stakingProvider].beneficiary,
        dist.claims[stakingProvider].amount,
        dist.merkleRoot,
        dist.claims[stakingProvider].proof
      )

      let afterBalance = await token.balanceOf(
        dist.claims[stakingProvider].beneficiary
      )

      // Just checking the rewards were claimed using the old Merkle contract
      expect(afterBalance).to.equal(
        prevBalance.add(dist.claims[stakingProvider].amount)
      )

      // Now we are going to claim the 2nd rewards dist using RewardsAggregator
      await rewardsAggregator.setMerkleRoot(cumDist.merkleRoot)

      const rewardsToBeClaimed =
        cumDist.claims[stakingProvider].amount -
        dist.claims[stakingProvider].amount

      prevBalance = await token.balanceOf(
        dist.claims[stakingProvider].beneficiary
      )

      const tx = await rewardsAggregator.claimMerkle(
        stakingProvider,
        cumDist.claims[stakingProvider].beneficiary,
        cumDist.claims[stakingProvider].amount,
        cumDist.merkleRoot,
        cumDist.claims[stakingProvider].proof
      )

      afterBalance = await token.balanceOf(
        dist.claims[stakingProvider].beneficiary
      )

      expect(afterBalance).to.equal(prevBalance.add(rewardsToBeClaimed))
      expect(tx)
        .to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(
          stakingProvider,
          rewardsToBeClaimed,
          cumDist.claims[stakingProvider].beneficiary,
          cumDist.merkleRoot
        )
    })

    it("should not be possible to claim twice or if no rewards available", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      await rewardsAggregator.claimMerkle(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )

      await expect(
        rewardsAggregator.claimMerkle(
          stakingProvider,
          beneficiary,
          amount,
          dist.merkleRoot,
          proof
        )
      ).to.be.revertedWith("Nothing to claim")
    })
    it("should be emitted an event when claiming", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      const tx = rewardsAggregator.claimMerkle(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )

      await expect(tx)
        .to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider, amount, beneficiary, dist.merkleRoot)
    })
    it("should be transferred the tokens when claiming", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      const prevBalanceBenef = await token.balanceOf(beneficiary)
      const prevBalanceRewardsHolder = await token.balanceOf(
        rewardsHolder.address
      )
      await rewardsAggregator.claimMerkle(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )
      const afterBalanceBenef = await token.balanceOf(beneficiary)
      const afterBalanceRewardsHolder = await token.balanceOf(
        rewardsHolder.address
      )

      expect(afterBalanceBenef).to.equal(prevBalanceBenef.add(amount))
      expect(afterBalanceRewardsHolder).to.equal(
        prevBalanceRewardsHolder.sub(amount)
      )
    })

    it("should be possible to claim a batch of rewards", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider0 = Object.keys(dist.claims)[0]
      const stakingProvider1 = Object.keys(dist.claims)[1]
      const stakingProvider2 = Object.keys(dist.claims)[2]
      const beneficiary0 = dist.claims[stakingProvider0].beneficiary
      const beneficiary1 = dist.claims[stakingProvider1].beneficiary
      const beneficiary2 = dist.claims[stakingProvider2].beneficiary
      const amount0 = dist.claims[stakingProvider0].amount
      const amount1 = dist.claims[stakingProvider1].amount
      const amount2 = dist.claims[stakingProvider2].amount
      const proof0 = dist.claims[stakingProvider0].proof
      const proof1 = dist.claims[stakingProvider1].proof
      const proof2 = dist.claims[stakingProvider2].proof

      const prevBalance0 = await token.balanceOf(beneficiary0)
      const prevBalance1 = await token.balanceOf(beneficiary1)
      const prevBalance2 = await token.balanceOf(beneficiary2)

      const tx = await rewardsAggregator.batchClaimMerkle(dist.merkleRoot, [
        [stakingProvider0, beneficiary0, amount0, proof0],
        [stakingProvider1, beneficiary1, amount1, proof1],
        [stakingProvider2, beneficiary2, amount2, proof2],
      ])

      const afterBalance0 = await token.balanceOf(beneficiary0)
      const afterBalance1 = await token.balanceOf(beneficiary1)
      const afterBalance2 = await token.balanceOf(beneficiary2)

      expect(afterBalance0).to.equal(prevBalance0.add(amount0))
      expect(afterBalance1).to.equal(prevBalance1.add(amount1))
      expect(afterBalance2).to.equal(prevBalance2.add(amount2))

      expect(tx)
        .to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider0, amount0, beneficiary0, dist.merkleRoot)
        .and.to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider1, amount1, beneficiary1, dist.merkleRoot)
        .and.to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider2, amount2, beneficiary2, dist.merkleRoot)
    })
  })

  describe("when asking for the cumulative Merkle already claimed", async function () {
    it("should return zero if no rewards have been already claimed", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const [, , , , , signer1] = await ethers.getSigners()
      const cumulativeMerkleClaimed =
        await rewardsAggregator.cumulativeMerkleClaimed(signer1.address)
      expect(cumulativeMerkleClaimed).to.equal(0)
    })

    it("should return correct amount when been claimed only through the RewardsAggregator contract", async function () {
      const { token, rewardsHolder, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      // First we claim the rewards
      await rewardsAggregator.claimMerkle(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )

      // Now, claimed rewards should return the claimed amount
      const rewardsClaimed = await rewardsAggregator.cumulativeMerkleClaimed(
        stakingProvider
      )

      expect(rewardsClaimed).to.equal(amount)
    })
    it("should return correct amount of rewards when been claimed only through the old Merkle contract", async function () {
      const {
        token,
        rewardsHolder,
        oldCumulativeMerkleDrop,
        rewardsAggregator,
      } = await loadFixture(deployContractsFixture)

      await token.mint(rewardsHolder.address, dist.totalAmount)

      await token
        .connect(rewardsHolder)
        .approve(oldCumulativeMerkleDrop.address, dist.totalAmount)

      await oldCumulativeMerkleDrop.setMerkleRoot(dist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      // First we claim the rewards using the old Merkle contract
      await oldCumulativeMerkleDrop.claim(
        stakingProvider,
        beneficiary,
        amount,
        dist.merkleRoot,
        proof
      )

      // Now, claimed rewards should return the claimed amount
      const rewardsClaimed = await rewardsAggregator.cumulativeMerkleClaimed(
        stakingProvider
      )

      expect(rewardsClaimed).to.equal(amount)
    })
    it("should return correct amount of rewards when been claimed through both RewardsAggregator and old Merkle contract", async function () {
      const {
        token,
        rewardsHolder,
        oldCumulativeMerkleDrop,
        rewardsAggregator,
      } = await loadFixture(deployContractsFixture)

      await token.mint(rewardsHolder.address, dist.totalAmount)

      await token
        .connect(rewardsHolder)
        .approve(oldCumulativeMerkleDrop.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)

      // There are two example distributions: dist & cumDist. The second one
      // increases the rewards of some of the first one's beneficiaries

      await oldCumulativeMerkleDrop.setMerkleRoot(dist.merkleRoot)
      await rewardsAggregator.setMerkleRoot(cumDist.merkleRoot)

      const stakingProvider = Object.keys(dist.claims)[0]

      // First we claim the rewards using the old Merkle contract
      await oldCumulativeMerkleDrop.claim(
        stakingProvider,
        dist.claims[stakingProvider].beneficiary,
        dist.claims[stakingProvider].amount,
        dist.merkleRoot,
        dist.claims[stakingProvider].proof
      )

      // Just checking the rewards were claimed using the old Merkle contract
      let rewardsClaimed = await rewardsAggregator.cumulativeMerkleClaimed(
        stakingProvider
      )
      expect(rewardsClaimed).to.equal(dist.claims[stakingProvider].amount)

      // Let's claim the rewards of the 2nd distribution using RewardsAggregator
      await rewardsAggregator.claimMerkle(
        stakingProvider,
        cumDist.claims[stakingProvider].beneficiary,
        cumDist.claims[stakingProvider].amount,
        cumDist.merkleRoot,
        cumDist.claims[stakingProvider].proof
      )

      // Now, claimed rewards should return the amount of the 2nd distribution
      rewardsClaimed = await rewardsAggregator.cumulativeMerkleClaimed(
        stakingProvider
      )
      expect(rewardsClaimed).to.equal(cumDist.claims[stakingProvider].amount)
    })
  })

  describe("when claiming rewards from Threshold apps", async function () {
    // Note that the Threshold app used in these tests is a mock that returns
    // a fixed value when calling `availableRewards` method
    it("should return true when checking if a staking prov can claim app rewards", async function () {
      const { rewardsAggregator } = await loadFixture(deployContractsFixture)
      const stakingProvider = Object.keys(dist.claims)[0]

      expect(await rewardsAggregator.canClaimApps(stakingProvider)).to.be.true
    })

    it("should be possible to claim rewards from apps using claimApps method", async function () {
      const { token, application, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(application.address, 100000)
      const stakingProvider = Object.keys(dist.claims)[0]
      const prevBalance = await token.balanceOf(stakingProvider)
      const tx = await rewardsAggregator.claimApps(stakingProvider)
      const afterBalance = await token.balanceOf(stakingProvider)
      expect(afterBalance).to.be.greaterThan(prevBalance)
      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider, anyValue)
    })

    it("should be possible to claim rewards from apps using claim(stProv) method", async function () {
      const { token, application, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(application.address, 100000)
      const stakingProvider = Object.keys(dist.claims)[0]
      const prevBalance = await token.balanceOf(stakingProvider)

      // Using function overloading is tricky in Hardhat (ethers.js)
      const tx = await rewardsAggregator["claim(address)"](stakingProvider)

      const afterBalance = await token.balanceOf(stakingProvider)
      expect(afterBalance).to.be.greaterThan(prevBalance)
      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider, anyValue)
    })

    it("should be possible to claim a batch of rewards from apps using batchClaimApps() method", async function () {
      const { token, application, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(application.address, 100000)
      const stakingProvider1 = Object.keys(dist.claims)[0]
      const stakingProvider2 = Object.keys(dist.claims)[2]
      const prevBalance1 = await token.balanceOf(stakingProvider1)
      const prevBalance2 = await token.balanceOf(stakingProvider2)

      const tx = await rewardsAggregator.batchClaimApps([
        stakingProvider1,
        stakingProvider2,
      ])

      const afterBalance1 = await token.balanceOf(stakingProvider1)
      const afterBalance2 = await token.balanceOf(stakingProvider2)

      expect(afterBalance1).to.be.greaterThan(prevBalance1)
      expect(afterBalance2).to.be.greaterThan(prevBalance2)
      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider1, anyValue)
        .and.to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider2, anyValue)
    })

    it("should be possible to claim a batch of rewards from apps using batchClaim() method", async function () {
      const { token, application, rewardsAggregator } = await loadFixture(
        deployContractsFixture
      )
      await token.mint(application.address, 100000)
      const stakingProvider1 = Object.keys(dist.claims)[0]
      const stakingProvider2 = Object.keys(dist.claims)[2]
      const prevBalance1 = await token.balanceOf(stakingProvider1)
      const prevBalance2 = await token.balanceOf(stakingProvider2)

      // Using function overloading is tricky in Hardhat (ethers.js)
      const tx = await rewardsAggregator["batchClaim(address[])"]([
        stakingProvider1,
        stakingProvider2,
      ])

      const afterBalance1 = await token.balanceOf(stakingProvider1)
      const afterBalance2 = await token.balanceOf(stakingProvider2)

      expect(afterBalance1).to.be.greaterThan(prevBalance1)
      expect(afterBalance2).to.be.greaterThan(prevBalance2)
      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider1, anyValue)
        .and.to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider2, anyValue)
    })
  })

  describe("when claiming rewards from both Threshold apps and Merkle dist", async function () {
    it("should be possible to claim both apps and Merkle rewards", async function () {
      // Let's set the Merkle distribution
      const { token, application, rewardsHolder, rewardsAggregator } =
        await loadFixture(deployContractsFixture)
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      // Threshold app mock will send tokens to staking provider
      await token.mint(application.address, 100000000)

      const stakingProvider = Object.keys(dist.claims)[0]
      const beneficiary = dist.claims[stakingProvider].beneficiary
      const amount = dist.claims[stakingProvider].amount
      const proof = dist.claims[stakingProvider].proof

      const prevBalance = await token.balanceOf(beneficiary)

      const tx = await rewardsAggregator[
        "claim(address,address,uint256,bytes32,bytes32[])"
      ](stakingProvider, beneficiary, amount, dist.merkleRoot, proof)

      const afterBalance = await token.balanceOf(beneficiary)

      // The beneficiary should be received the tokens from the distribution
      // plus the tokens from the mocked app
      expect(afterBalance.sub(amount).sub(prevBalance)).to.be.greaterThan(0)
      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider, anyValue)
        .and.to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider, amount, beneficiary, dist.merkleRoot)
    })

    it("should be possible to batch-claim both apps and Merkle rewards", async function () {
      // Let's set the Merkle distribution
      const { token, application, rewardsHolder, rewardsAggregator } =
        await loadFixture(deployContractsFixture)
      await token.mint(rewardsHolder.address, dist.totalAmount)
      await token
        .connect(rewardsHolder)
        .approve(rewardsAggregator.address, dist.totalAmount)
      await rewardsAggregator.setMerkleRoot(dist.merkleRoot)

      // Threshold app mock will send tokens to staking provider
      await token.mint(application.address, 100000000)

      const stakingProvider0 = Object.keys(dist.claims)[0]
      const stakingProvider1 = Object.keys(dist.claims)[1]
      const beneficiary0 = dist.claims[stakingProvider0].beneficiary
      const beneficiary1 = dist.claims[stakingProvider1].beneficiary
      const amount0 = dist.claims[stakingProvider0].amount
      const amount1 = dist.claims[stakingProvider1].amount
      const proof0 = dist.claims[stakingProvider0].proof
      const proof1 = dist.claims[stakingProvider1].proof

      const prevBalance0 = await token.balanceOf(beneficiary0)
      const prevBalance1 = await token.balanceOf(beneficiary1)

      const tx = await rewardsAggregator[
        "batchClaim(bytes32,(address,address,uint256,bytes32[])[])"
      ](dist.merkleRoot, [
        [stakingProvider0, beneficiary0, amount0, proof0],
        [stakingProvider1, beneficiary1, amount1, proof1],
      ])

      const afterBalance0 = await token.balanceOf(beneficiary0)
      const afterBalance1 = await token.balanceOf(beneficiary1)

      // The beneficiary should be received the tokens from the distribution
      // plus the tokens from the mocked app
      expect(afterBalance0.sub(amount0).sub(prevBalance0)).to.be.greaterThan(0)
      expect(afterBalance1.sub(amount1).sub(prevBalance1)).to.be.greaterThan(0)

      expect(tx)
        .to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider0, anyValue)
        .and.to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider0, amount0, beneficiary0, dist.merkleRoot)
        .and.to.emit(rewardsAggregator, "RewardsWithdrawn")
        .withArgs(stakingProvider1, anyValue)
        .and.to.emit(rewardsAggregator, "MerkleClaimed")
        .withArgs(stakingProvider1, amount1, beneficiary1, dist.merkleRoot)
    })
  })
})
