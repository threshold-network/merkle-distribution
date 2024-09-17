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
      hardhat: 0,
      sepolia: 0,
      mainnet: 0,
    },
    merkleRewardsHolder: {
      hardhat: "0xec8183891331a845E2DCf5CD616Ee32736E2BAA4",
      mainnet: "0xec8183891331a845E2DCf5CD616Ee32736E2BAA4",
    },
    tokenContract: {
      hardhat: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5",
      sepolia: "0x46abDF5aD1726ba700794539C3dB8fE591854729",
      mainnet: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5",
    },
    // TODO: check if council is the right owner
    owner: {
      hardhat: "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f",
      sepolia: 0,
      mainnet: "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f",
    },
    tacoApp: {
      hardhat: "0x347CC7ede7e5517bD47D20620B2CF1b406edcF07",
      sepolia: "0x329bc9Df0e45f360583374726ccaFF003264a136",
      mainnet: "0x347CC7ede7e5517bD47D20620B2CF1b406edcF07",
    },
    oldCumulativeMerkleDrop: {
      hardhat: "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37",
      mainnet: "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37",
    },
  },
  networks,
}
