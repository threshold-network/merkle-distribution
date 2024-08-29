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

module.exports = { genMerkleLeaf, onlyUnique }
