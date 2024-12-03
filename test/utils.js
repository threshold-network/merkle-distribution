const fs = require("fs")
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
  const [owner, merkleRewardsHolder] = await ethers.getSigners()

  const Token = await ethers.getContractFactory("TokenMock")
  const ApplicationMock = await ethers.getContractFactory("ApplicationMock")
  const RewardsAggregator = await ethers.getContractFactory("RewardsAggregator")
  const CumulativeMerkleDrop = await ethers.getContractFactory(
    "CumulativeMerkleDrop"
  )

  const token = await Token.deploy()
  await token.mint(merkleRewardsHolder.address, 1)
  const application = await ApplicationMock.deploy(token.address)
  const oldCumulativeMerkleDrop = await CumulativeMerkleDrop.deploy(
    token.address,
    merkleRewardsHolder.address,
    owner.address
  )
  const rewardsAggregator = await RewardsAggregator.deploy(
    token.address,
    application.address,
    oldCumulativeMerkleDrop.address,
    merkleRewardsHolder.address,
    owner.address
  )

  return {
    owner,
    merkleRewardsHolder,
    token,
    application,
    oldCumulativeMerkleDrop,
    rewardsAggregator,
  }
}

function getLastMerkleClaim(stakingProvider) {
  // Read the dists folders and take only those with YYYY/MM/DD format
  let distDates = fs
    .readdirSync("./distributions")
    .filter((dist) => /^\d{4}-\d{2}-\d{2}$/.test(dist))

  distDates = distDates.sort().reverse()
  const distFile = fs.readFileSync(
    `./distributions/${distDates[0]}/MerkleDist.json`
  )
  const dist = JSON.parse(distFile)
  const claim = dist.claims[stakingProvider]
  claim["merkleRoot"] = dist.merkleRoot

  return claim
}

module.exports = {
  genMerkleLeaf,
  onlyUnique,
  deployContractsFixture,
  getLastMerkleClaim,
}
