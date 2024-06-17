const { ethers } = require("hardhat")
const { expect } = require("chai")
const { before, beforeEach, describe, it } = require("mocha")
const { MerkleTree } = require("merkletreejs")
const fc = require("fast-check")
const keccak256 = require("keccak256")

const { dist } = require("./constants")
const { cumDist } = require("./constants")

function genMerkleLeaf(account, beneficiary, amount) {
  const amountHex = ethers.BigNumber.from(amount).toHexString()
  const leaf =
    account + beneficiary.substr(2) + amountHex.slice(2).padStart(64, "0")
  return MerkleTree.bufferToHex(keccak256(leaf))
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

describe("Merkle Distribution", function () {
  let token
  let application

  before(function () {
    // numRuns must be less or equal to the number of accounts in `dist`
    const numRuns = Object.keys(dist.claims).length
    fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
  })

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("TokenMock")
    const ApplicationMock = await ethers.getContractFactory("ApplicationMock")
    token = await Token.deploy()
    application = await ApplicationMock.deploy()
  })

  describe("when deploy MerkleDistributor", async function () {
    let MerkleDist
    let owner
    let rewardsHolder

    beforeEach(async function () {
      ;[owner, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, 10)
      MerkleDist = await ethers.getContractFactory("MerkleDistributor")
    })

    it("should be deployed", async function () {
      const merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        owner.address
      )
      expect(await merkleDist.token()).to.equal(token.address)
      expect(await merkleDist.rewardsHolder()).to.equal(rewardsHolder.address)
      expect(await merkleDist.application()).to.equal(application.address)
      expect(await merkleDist.owner()).to.equal(owner.address)
    })

    it("should not be possible to deploy with no token address", async function () {
      const tokenAddress = ethers.constants.AddressZero
      await expect(
        MerkleDist.deploy(
          tokenAddress,
          application.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.reverted
    })

    it("should not be possible to deploy with no minted tokens", async function () {
      const TokenWithNoMint = await ethers.getContractFactory("TokenMock")
      const tokenWithNoMint = await TokenWithNoMint.deploy()
      await expect(
        MerkleDist.deploy(
          tokenWithNoMint.address,
          application.address,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Token contract must be set")
    })

    it("should not be possible to deploy with no rewards holder", async function () {
      const rewardsHolder = ethers.constants.AddressZero
      await expect(
        MerkleDist.deploy(
          token.address,
          application.address,
          rewardsHolder,
          owner.address
        )
      ).to.be.revertedWith("Rewards Holder must be an address")
    })

    it("should not be possible to deploy with no application", async function () {
      const applicationAddress = ethers.constants.AddressZero
      await expect(
        MerkleDist.deploy(
          token.address,
          applicationAddress,
          rewardsHolder.address,
          owner.address
        )
      ).to.be.revertedWith("Application must be an address")
    })
  })

  describe("when set Merkle Root for first time", async function () {
    let merkleDist

    beforeEach(async function () {
      const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
      const [owner, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, 10)
      merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        owner.address
      )
    })

    it("should be 0 before setting it up", async function () {
      const contractMerkleRoot = await merkleDist.merkleRoot()
      expect(parseInt(contractMerkleRoot, 16)).to.equal(0)
    })

    it("should be possible to be set a new one", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 64, maxLength: 64 }),
          async function (merkleRoot) {
            merkleRoot = "0x" + merkleRoot
            await merkleDist.setMerkleRoot(merkleRoot)
            const contractMerkleRoot = await merkleDist.merkleRoot()
            expect(contractMerkleRoot).to.equal(merkleRoot)
          }
        )
      )
    })

    it("should be emitted an event", async function () {
      const prevMerkleRoot = await merkleDist.merkleRoot()
      const nextMerkleRoot =
        "0xb2c0cd477fff5f352df19233236e02bac0c4170a783f11cd39589413132914cc"
      const tx = merkleDist.setMerkleRoot(nextMerkleRoot)
      await expect(tx)
        .to.emit(merkleDist, "MerkelRootUpdated")
        .withArgs(prevMerkleRoot, nextMerkleRoot)
    })

    it("only contract's owner should can change Merkle Root", async function () {
      const [, addr1] = await ethers.getSigners()
      const merkleRoot =
        "0xb2c0cd477fff5f352df19233236e02bac0c4170a783f11cd39589413132914cc"
      await expect(
        merkleDist.connect(addr1).setMerkleRoot(merkleRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("when batch claim tokens", async function () {
    let merkleDist
    let merkleRoot
    let totalAmount
    let proofAccounts

    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = 2
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
      merkleRoot = dist.merkleRoot
      totalAmount = ethers.BigNumber.from(dist.totalAmount)
      proofAccounts = Object.keys(dist.claims)
    })

    beforeEach(async function () {
      const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
      const [, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, totalAmount)
      merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        rewardsHolder.address
      )
      await merkleDist.connect(rewardsHolder).setMerkleRoot(merkleRoot)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
    })

    it("should accounts get tokens", async function () {
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
            await merkleDist.batchClaim(merkleRoot, claimStructs)

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

  describe("when claim tokens", async function () {
    let merkleDist
    let merkleRoot
    let totalAmount
    let proofAccounts

    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(dist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
      merkleRoot = dist.merkleRoot
      totalAmount = ethers.BigNumber.from(dist.totalAmount)
      proofAccounts = Object.keys(dist.claims)
    })

    beforeEach(async function () {
      const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
      const [owner, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, totalAmount)
      merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        owner.address
      )
      await merkleDist.setMerkleRoot(merkleRoot)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
    })

    it("should be emitted an event", async function () {
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
            const tx = merkleDist.claim(
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
            await merkleDist.claim(
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
            await merkleDist.claim(
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
      const claimAccount = ethers.Wallet.createRandom().address
      const claimAmount = 100000
      const claimProof = [
        "0xf558bba7dd8aef6fdfb36ea106d965fd7ef483aa217cc02e2c33b78cdfb74cab",
        "0x7a8326f3dfbbddc4a0bc1e3e5005d4cecf6a7c89d386692a27dc5235b55e92cd",
      ]
      const claimBeneficiary = ethers.Wallet.createRandom().address
      await expect(
        merkleDist.claim(
          claimAccount,
          claimBeneficiary,
          claimAmount,
          merkleRoot,
          claimProof
        )
      ).to.be.revertedWith("Invalid proof")
    })

    it("should not be possible to claim a different amount of tokens", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          fc.integer({ min: 0, max: 10000000 }),
          async function (index, claimAmount) {
            const claimAccount = proofAccounts[index]
            const claimProof = dist.claims[claimAccount].proof
            const claimBeneficiary = dist.claims[claimAccount].beneficiary
            await expect(
              merkleDist.claim(
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
            await merkleDist.claim(
              claimAccount,
              claimBeneficiary,
              claimAmount,
              merkleRoot,
              claimProof
            )
            await expect(
              merkleDist.claim(
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

  describe("when set a new Merkle Distribution (cumulative)", async function () {
    let merkleDist
    let merkleRoot
    let cumulativeMerkleRoot
    let totalAmount
    let cumulativetotalAmount
    let proofAccounts
    let cumulativeProofAccounts

    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(cumDist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
      merkleRoot = dist.merkleRoot
      cumulativeMerkleRoot = cumDist.merkleRoot
      totalAmount = ethers.BigNumber.from(dist.totalAmount)
      cumulativetotalAmount = ethers.BigNumber.from(cumDist.totalAmount)
      proofAccounts = Object.keys(dist.claims)
      cumulativeProofAccounts = Object.keys(cumDist.claims)
    })

    beforeEach(async function () {
      const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
      const [owner, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, totalAmount)
      merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        owner.address
      )
      await merkleDist.setMerkleRoot(merkleRoot)
      await token
        .connect(rewardsHolder)
        .approve(merkleDist.address, totalAmount)
    })

    it("should be possible to set a new Merkle Root after claiming", async function () {
      const claimAccount = proofAccounts[0]
      const claimAmount = ethers.BigNumber.from(
        dist.claims[claimAccount].amount
      )
      const claimProof = dist.claims[claimAccount].proof
      const claimBeneficiary = dist.claims[claimAccount].beneficiary

      await merkleDist.claim(
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

    it("should not be possible to claim using old Merkle Root", async function () {
      const claimAccount = proofAccounts[0]
      const claimAmount = ethers.BigNumber.from(
        dist.claims[claimAccount].amount
      )
      const claimProof = dist.claims[claimAccount].proof
      const claimBeneficiary = dist.claims[claimAccount].beneficiary
      await merkleDist.setMerkleRoot(cumulativeMerkleRoot)

      await expect(
        merkleDist.claim(
          claimAccount,
          claimBeneficiary,
          claimAmount,
          merkleRoot,
          claimProof
        )
      ).to.be.revertedWith("Merkle root was updated")
    })

    describe("after claiming all tokens of the previous distribution", async function () {
      beforeEach(async function () {
        for (let claimAccount of proofAccounts) {
          const claimAmount = ethers.BigNumber.from(
            dist.claims[claimAccount].amount
          )
          const claimProof = dist.claims[claimAccount].proof
          const claimBeneficiary = dist.claims[claimAccount].beneficiary
          await merkleDist.claim(
            claimAccount,
            claimBeneficiary,
            claimAmount,
            merkleRoot,
            claimProof
          )
        }
      })

      it("should not be possible to claim without enough balance in contract", async function () {
        await merkleDist.setMerkleRoot(cumulativeMerkleRoot)

        const claimAccount = cumulativeProofAccounts[0]
        const claimAmount = ethers.BigNumber.from(
          cumDist.claims[claimAccount].amount
        )
        const claimProof = cumDist.claims[claimAccount].proof
        const claimBeneficiary = cumDist.claims[claimAccount].beneficiary

        await expect(
          merkleDist.claim(
            claimAccount,
            claimBeneficiary,
            claimAmount,
            cumulativeMerkleRoot,
            claimProof
          )
        ).to.be.revertedWith("Transfer amount exceeds allowance")
      })

      it("should be possible to claim new distribution tokens", async function () {
        const [, rewardsHolder] = await ethers.getSigners()
        await token.mint(rewardsHolder.address, cumulativetotalAmount)
        await merkleDist.setMerkleRoot(cumulativeMerkleRoot)
        await token
          .connect(rewardsHolder)
          .approve(merkleDist.address, cumulativetotalAmount)

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

              // add up all rewards from previous distribution
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

              await merkleDist.claim(
                claimAccount,
                claimBeneficiary,
                claimAmount,
                cumulativeMerkleRoot,
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
    let merkleDist
    let merkleRoot
    let proofAccounts

    before(function () {
      // numRuns must be less or equal to the number of accounts in `cum_dist`
      const numRuns = Object.keys(dist.claims).length
      fc.configureGlobal({ numRuns: numRuns, skipEqualValues: true })
      merkleRoot = dist.merkleRoot
      proofAccounts = Object.keys(dist.claims)
    })

    beforeEach(async function () {
      const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
      const [owner, rewardsHolder] = await ethers.getSigners()
      await token.mint(rewardsHolder.address, 10)
      merkleDist = await MerkleDist.deploy(
        token.address,
        application.address,
        rewardsHolder.address,
        owner.address
      )
      await merkleDist.setMerkleRoot(merkleRoot)
    })

    it("should not be verified if no Merkle Proof", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = []
            const verif = await merkleDist.verify(claimProof, merkleRoot, leaf)
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should not be verified with incorrect Merkle Proof", async function () {
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
            const verif = await merkleDist.verify(claimProof, merkleRoot, leaf)
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should a correct MerkleProof be verified", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          async function (index) {
            const account = proofAccounts[index]
            const amount = dist.claims[account].amount
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(claimProof, merkleRoot, leaf)
            expect(verif).to.be.true
          }
        )
      )
    })

    it("should not be verified a Merkle Proof with incorrect root", async function () {
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
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: proofAccounts.length - 1 }),
          fc.integer({ min: 1, max: 1000000000 }),
          async function (index, amount) {
            const account = proofAccounts[index]
            const beneficiary = dist.claims[account].beneficiary
            const leaf = genMerkleLeaf(account, beneficiary, amount)
            const claimProof = dist.claims[account].proof
            const verif = await merkleDist.verify(claimProof, merkleRoot, leaf)
            expect(verif).to.be.false
          }
        )
      )
    })

    it("should not be verified a Merkle Proof with incorrect account", async function () {
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
            const verif = await merkleDist.verify(claimProof, merkleRoot, leaf)
            expect(verif).to.be.false
          }
        )
      )
    })
  })
})
