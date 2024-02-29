import { Contract } from "ethers"
import { program } from "commander"
import { ethers } from "ethers"
import {
  abi as RandomBeaconABI,
  address as RandomBeaconAddress,
} from "@keep-network/random-beacon/artifacts/RandomBeacon.json"
import {
  abi as WalletRegistryABI,
  address as WalletRegistryAddress,
} from "@keep-network/ecdsa/artifacts/WalletRegistry.json"

program
  .version("0.0.1")
  .requiredOption("-x, --staker-address <address>", "staker address")
  .requiredOption("-n, --network <network>", "mainnet, goerli, etc")
  .parse(process.argv)

// Parse the program options
const options = program.opts()
const stakerAddress = options.stakerAddress
const network = options.network

export async function staker2operator() {
  const provider = new ethers.providers.EtherscanProvider(
    network,
    process.env.ETHERSCAN_TOKEN
  )

  const randomBeacon = new Contract(
    RandomBeaconAddress,
    JSON.stringify(RandomBeaconABI),
    provider
  )

  const walletRegistry = new Contract(
    WalletRegistryAddress,
    JSON.stringify(WalletRegistryABI),
    provider
  )

  // Staking provider should be the same for Beacon and TBTC apps
  const operatorAddress = await randomBeacon.stakingProviderToOperator(
    stakerAddress
  )
  const operatorAddressForTbtc = await walletRegistry.stakingProviderToOperator(
    stakerAddress
  )

  if (operatorAddress !== operatorAddressForTbtc) {
    console.log(
      `Operator addresses for Beacon ${operatorAddress} and TBTC ${operatorAddressForTbtc} must match. `
    )
    return
  }

  if (operatorAddress === ethers.constants.AddressZero) {
    console.log("Operator provider cannot be zero address. ")
    return
  }

  console.log(
    `Operator address for staker[${stakerAddress}] is ${operatorAddress}`
  )
}

staker2operator()
