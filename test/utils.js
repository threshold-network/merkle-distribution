const { ethers } = require("hardhat")
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

function genMerkleLeaf(account, beneficiary, amount) {
  const amountHex = ethers.BigNumber.from(amount).toHexString()
  const leaf =
    account + beneficiary.substr(2) + amountHex.slice(2).padStart(64, "0")
  return MerkleTree.bufferToHex(keccak256(leaf))
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

async function deployContractsFixture() {
  const [owner, rewardsHolder] = await ethers.getSigners()

  const Token = await ethers.getContractFactory("TokenMock")
  const ApplicationMock = await ethers.getContractFactory("ApplicationMock")
  const RewardsAggregator = await ethers.getContractFactory("RewardsAggregator")
  const OldMerkleDistribution = await ethers.getContractFactory("OldMerkleDistribution")

  const token = await Token.deploy()
  await token.mint(rewardsHolder.address, 1)
  const application = await ApplicationMock.deploy(token.address)
  const oldMerkleDistribution = await OldMerkleDistribution.deploy(
    token.address,
    rewardsHolder.address,
    owner.address
  )
  const rewardsAggregator = await RewardsAggregator.deploy(
    token.address,
    application.address,
    oldMerkleDistribution.address,
    rewardsHolder.address,
    owner.address
  )

  return {
    owner,
    rewardsHolder,
    token,
    application,
    oldMerkleDistribution,
    rewardsAggregator,
  }
}

module.exports = { genMerkleLeaf, onlyUnique, deployContractsFixture }
