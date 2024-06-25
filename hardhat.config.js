require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("hardhat-ignore-warnings")
require("dotenv").config()
require("./src/tasks/claim_rewards")

const { networks, etherscan } = require("./hardhat.networks")

module.exports = {
  etherscan,
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      sepolia: 0,
      mainnet: 0,
      mainnet_test: 0,
    },
    rewardsHolder: {
      sepolia: "0xCe692F6fA86319Af43050fB7F09FDC43319F7612",
      mainnet: "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f",
      mainnet_test: 0,
    },
    tokenContract: {
      sepolia: "0x46abDF5aD1726ba700794539C3dB8fE591854729",
      mainnet: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5",
    },
    owner: {
      sepolia: 0,
      mainnet: "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f",
      mainnet_test: 0,
    },
    tacoApp: {
      sepolia: "0x329bc9Df0e45f360583374726ccaFF003264a136",
      mainnet: "0x347CC7ede7e5517bD47D20620B2CF1b406edcF07",
    },
  },
  networks,
}
