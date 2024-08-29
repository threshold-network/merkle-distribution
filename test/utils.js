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
  const MerkleDist = await ethers.getContractFactory("MerkleDistributor")
  const OldMerkleDist = await ethers.getContractFactory("OldMerkleDistributor")

  const token = await Token.deploy()
  await token.mint(rewardsHolder.address, 1)
  const application = await ApplicationMock.deploy(token.address)
  const oldMerkleDist = await OldMerkleDist.deploy(
    token.address,
    rewardsHolder.address,
    owner.address
  )
  const merkleDist = await MerkleDist.deploy(
    token.address,
    application.address,
    oldMerkleDist.address,
    rewardsHolder.address,
    owner.address
  )

  return {
    owner,
    rewardsHolder,
    token,
    application,
    oldMerkleDist,
    merkleDist,
  }
}

module.exports = { genMerkleLeaf, onlyUnique, deployContractsFixture }
