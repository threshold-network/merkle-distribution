import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethers"
import { program } from "commander"
import * as fs from "fs"
import { ethers } from "ethers"
import {
  abi as RandomBeaconABI,
  address as RandomBeaconAddress,
} from "@keep-network/random-beacon/artifacts/RandomBeacon.json"
import {
  abi as WalletRegistryABI,
  address as WalletRegistryAddress,
} from "@keep-network/ecdsa/artifacts/WalletRegistry.json"
import {
  abi as TokenStakingABI,
  address as TokenStakingAddress,
} from "@threshold-network/solidity-contracts/artifacts/TokenStaking.json"
import {
  BEACON_AUTHORIZATION,
  TBTC_AUTHORIZATION,
  IS_BEACON_AUTHORIZED,
  IS_TBTC_AUTHORIZED,
  IS_UP_TIME_SATISFIED,
  IS_PRE_PARAMS_SATISFIED,
  IS_VERSION_SATISFIED,
  PRECISION,
  OPERATORS_SEARCH_QUERY_STEP,
} from "./rewards-constants"
import { InstanceParams } from "./types"
import { Utils } from "./utils"

program
  .version("0.0.1")
  .requiredOption(
    "-s, --start-timestamp <timestamp>",
    "starting time for rewards calculation"
  )
  .requiredOption(
    "-e, --end-timestamp <timestamp>",
    "ending time for rewards calculation"
  )
  .requiredOption(
    "-b, --start-block <timestamp>",
    "start block for rewards calculation"
  )
  .requiredOption(
    "-z, --end-block <timestamp>",
    "end block for rewards calculation"
  )
  .requiredOption("-a, --api <prometheus api>", "prometheus API")
  .requiredOption("-j, --job <prometheus job>", "prometheus job")
  .requiredOption(
    "-r, --releases <client releases in a rewards interval>",
    "client releases in a rewards interval"
  )
  .requiredOption("-n, --network <name>", "network name")
  .requiredOption(
    "-x, --operator-address <address>",
    "Only report on staker address"
  )
  .requiredOption("-d, --output-file <file>", "output JSON details path")
  .requiredOption("-q, --required-pre-params <number>", "required pre params")
  .requiredOption("-m, --required-uptime <percent>", "required uptime")
  .parse(process.argv)

// Parse the program options
const options = program.opts()
const prometheusJob = options.job
const prometheusAPI = options.api
const clientReleases = options.releases.split("|") // sorted from latest to oldest
const startRewardsTimestamp = parseInt(options.startTimestamp)
const endRewardsTimestamp = parseInt(options.endTimestamp)
const startRewardsBlock = parseInt(options.startBlock)
const endRewardsBlock = parseInt(options.endBlock)
const operatorAddress = options.operatorAddress
const outputFile = options.outputFile
const network = options.network
const requiredPreParams = options.requiredPreParams
const requiredUptime = options.requiredUptime // percent

const prometheusAPIQuery = `${prometheusAPI}/query`
// Go back in time relevant to the current date to get data for the exact
// rewards interval dates.
const offset = Math.floor(Date.now() / 1000) - endRewardsTimestamp

const utils = new Utils(
  prometheusAPI,
  prometheusAPIQuery,
  prometheusJob,
  offset,
  endRewardsTimestamp,
  requiredUptime,
  requiredPreParams
)

export async function calculateRequirements() {
  if (Date.now() / 1000 < endRewardsTimestamp) {
    console.log("End time interval must be in the past")
    return "End time interval must be in the past"
  }

  const provider = new ethers.providers.EtherscanProvider(
    network,
    process.env.ETHERSCAN_TOKEN
  )

  const rewardsInterval = endRewardsTimestamp - startRewardsTimestamp
  const currentBlockNumber = await provider.getBlockNumber()

  // Query for bootstrap data that has peer instances grouped by operators
  const queryBootstrapData = `${prometheusAPI}/query_range`
  const paramsBootstrapData = {
    query: `sum by(chain_address)({job='${prometheusJob}'})`,
    start: startRewardsTimestamp,
    end: endRewardsTimestamp,
    step: OPERATORS_SEARCH_QUERY_STEP,
  }

  const bootstrapData = (
    await utils.queryPrometheus(queryBootstrapData, paramsBootstrapData)
  ).data.result

  const operatorsData = new Array()

  const randomBeacon = new Contract(
    RandomBeaconAddress,
    JSON.stringify(RandomBeaconABI),
    provider
  )

  const tokenStaking = new Contract(
    TokenStakingAddress,
    JSON.stringify(TokenStakingABI),
    provider
  )

  const walletRegistry = new Contract(
    WalletRegistryAddress,
    JSON.stringify(WalletRegistryABI),
    provider
  )

  console.log("Fetching AuthorizationIncreased events in rewards interval...")
  const intervalAuthorizationIncreasedEvents = await tokenStaking.queryFilter(
    "AuthorizationIncreased",
    startRewardsBlock,
    endRewardsBlock
  )

  console.log("Fetching AuthorizationDecreased events in rewards interval...")
  let intervalAuthorizationDecreasedEvents = await tokenStaking.queryFilter(
    "AuthorizationDecreaseApproved",
    startRewardsBlock,
    endRewardsBlock
  )

  console.log(
    "Fetching AuthorizationIncreased events after rewards interval..."
  )
  const postIntervalAuthorizationIncreasedEvents =
    await tokenStaking.queryFilter(
      "AuthorizationIncreased",
      endRewardsBlock,
      currentBlockNumber
    )

  console.log(
    "Fetching AuthorizationDecreasedApproved events after rewards interval..."
  )
  let postIntervalAuthorizationDecreasedApprovedEvents =
    await tokenStaking.queryFilter(
      "AuthorizationDecreaseApproved",
      endRewardsBlock,
      currentBlockNumber
    )

  console.log(
    "Fetching AuthorizationDecreasedRequested events after rewards interval..."
  )
  let postIntervalAuthorizationDecreasedRequestedEvents =
    await tokenStaking.queryFilter(
      "AuthorizationDecreaseRequested",
      endRewardsBlock,
      currentBlockNumber
    )

  // Special case: legacy stakes
  // const legacyEvents = await getLegacyEvents(provider)

  // For Dec 1st distribution, legacy stakes will not receive rewards.
  // The corresponding rewards will be received in following distributions.
  const legacyEvents: ethers.Event[] = []

  const intervalLegacyEvents = legacyEvents.filter(
    (event) =>
      event.blockNumber >= startRewardsBlock &&
      event.blockNumber < endRewardsBlock
  )
  const postLegacyEvents = legacyEvents.filter(
    (event) => event.blockNumber > endRewardsBlock - 1
  )

  intervalAuthorizationDecreasedEvents =
    intervalAuthorizationDecreasedEvents.concat(intervalLegacyEvents)

  const postIntervalAuthorizationDecreasedEvents =
    postIntervalAuthorizationDecreasedApprovedEvents
      .concat(postIntervalAuthorizationDecreasedRequestedEvents)
      .concat(postLegacyEvents)

  /// filter out operators we don't care about
  const operators = bootstrapData.filter(
    (bootstrapEntry: any) =>
      bootstrapEntry.metric.chain_address.toLowerCase() ===
      operatorAddress.toLowerCase()
  )

  if (!operators.length) {
    console.log(
      `No operator found for ${operatorAddress} in list of operator addresses: `
    )
    bootstrapData.forEach((o: any) => console.log(o.metric.chain_address))
  }

  for (let i = 0; i < operators.length; i++) {
    const operatorAddress = operators[i].metric.chain_address
    let authorizations = new Map<string, BigNumber>() // application: value
    let requirements = new Map<string, boolean>() // factor: true | false
    let instancesData = new Map<string, InstanceParams>()
    let operatorData: any = {}

    // Staking provider should be the same for Beacon and TBTC apps
    const stakingProvider = await randomBeacon.operatorToStakingProvider(
      operatorAddress
    )
    const stakingProviderAddressForTbtc =
      await walletRegistry.operatorToStakingProvider(operatorAddress)

    if (stakingProvider !== stakingProviderAddressForTbtc) {
      console.log(
        `Staking providers for Beacon ${stakingProvider} and TBTC ${stakingProviderAddressForTbtc} must match. ` +
          `No Rewards were calculated for operator ${operatorAddress}`
      )
      continue
    }

    if (stakingProvider === ethers.constants.AddressZero) {
      console.log(
        "Staking provider cannot be zero address. " +
          `No Rewards were calculated for operator ${operatorAddress}`
      )
      continue
    }

    // Events that were emitted between the [start:end] rewards dates for a given
    // stakingProvider.
    let intervalEvents = intervalAuthorizationIncreasedEvents.concat(
      intervalAuthorizationDecreasedEvents
    )
    if (intervalEvents.length > 0) {
      intervalEvents = intervalEvents.filter(
        (event) => event.args!.stakingProvider === stakingProvider
      )
    }

    // Events that were emitted between the [end:now] dates for a given
    // stakingProvider.
    let postIntervalEvents = postIntervalAuthorizationIncreasedEvents.concat(
      postIntervalAuthorizationDecreasedEvents
    )
    if (postIntervalEvents.length > 0) {
      postIntervalEvents = postIntervalEvents.filter(
        (event) => event.args!.stakingProvider === stakingProvider
      )
    }

    /// Random Beacon application authorization requirement
    let beaconIntervalEvents = new Array()
    if (intervalEvents.length > 0) {
      beaconIntervalEvents = intervalEvents.filter(
        (obj) => obj.args!.application == randomBeacon.address
      )
    }

    let beaconPostIntervalEvents = new Array()
    if (postIntervalEvents.length > 0) {
      beaconPostIntervalEvents = postIntervalEvents.filter(
        (obj) => obj.args!.application == randomBeacon.address
      )
    }

    const beaconAuthorization = await utils.getAuthorization(
      randomBeacon,
      beaconIntervalEvents,
      beaconPostIntervalEvents,
      stakingProvider,
      startRewardsBlock,
      endRewardsBlock,
      currentBlockNumber
    )
    authorizations.set(BEACON_AUTHORIZATION, beaconAuthorization.toString())
    requirements.set(IS_BEACON_AUTHORIZED, !beaconAuthorization.isZero())

    /// tBTC application authorized requirement
    let tbtcIntervalEvents = new Array()
    if (intervalEvents.length > 0) {
      tbtcIntervalEvents = intervalEvents.filter(
        (obj) => obj.args!.application == walletRegistry.address
      )
    }

    let tbtcPostIntervalEvents = new Array()
    if (postIntervalEvents.length > 0) {
      tbtcPostIntervalEvents = postIntervalEvents.filter(
        (obj) => obj.args!.application == walletRegistry.address
      )
    }

    const tbtcAuthorization = await utils.getAuthorization(
      walletRegistry,
      tbtcIntervalEvents,
      tbtcPostIntervalEvents,
      stakingProvider,
      startRewardsBlock,
      endRewardsBlock,
      currentBlockNumber
    )

    authorizations.set(TBTC_AUTHORIZATION, tbtcAuthorization.toString())
    requirements.set(IS_TBTC_AUTHORIZED, !tbtcAuthorization.isZero())

    /// Off-chain client reqs

    // Populate instances for a given operator.
    await utils.instancesForOperator(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    /// Uptime requirement
    let { uptimeCoefficient, isUptimeSatisfied } = await utils.checkUptime(
      operatorAddress,
      rewardsInterval,
      instancesData
    )
    // BigNumbers cannot operate on floats. Coefficient needs to be multiplied
    // by PRECISION
    uptimeCoefficient = Math.floor(uptimeCoefficient * PRECISION)
    requirements.set(IS_UP_TIME_SATISFIED, isUptimeSatisfied)

    /// Pre-params requirement
    const isPrePramsSatisfied = await utils.checkPreParams(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    requirements.set(IS_PRE_PARAMS_SATISFIED, isPrePramsSatisfied)

    requirements.set(
      IS_VERSION_SATISFIED,
      await utils.isVersionSatisfied(
        operatorAddress,
        rewardsInterval,
        startRewardsTimestamp,
        endRewardsTimestamp,
        clientReleases,
        instancesData
      )
    )

    operatorData[stakingProvider] = {
      applications: Object.fromEntries(authorizations),
      instances: utils.convertToObject(instancesData),
      requirements: Object.fromEntries(requirements),
    }

    operatorsData.push(operatorData)
  }

  // insert params for requirements calculation as first element
  operatorsData.unshift({
    requiredUptime: requiredUptime,
    operatorAddress: operatorAddress,
    startRewardsBlock: startRewardsBlock,
    endRewardsBlock: endRewardsBlock,
    startRewardsTimestamp: startRewardsTimestamp,
    endRewardsTimestamp: endRewardsTimestamp,
  })

  fs.writeFileSync(outputFile, JSON.stringify(operatorsData, null, 4))
}

// Special case: Dec 1st 23 distribution
// When legacy stakes (Keep and Nu staking) were deactivated from Threshold
// staking, the T tokens staked in the contract and that came from the legacy
// tokens (keepInT, nuInT in the contract) were unstaked.
// In addition to this, those legacy tokens that were part of Threshold apps
// authorizations (walletRegistry, randomBeacon) are no longer part of the
// authorization.
// But no `AuthorizationDecreaseApproved` events where emitted, but a special
// event "AuthorizationInvoluntaryDecreased". So the script were not able to
// correctly calculate the authorization for this period.

// Transaction in which legacy stakes were disabled:
// https://etherscan.io/tx/0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656
// async function getLegacyEvents(provider: ethers.providers.EtherscanProvider) {
//   const legacyTxHash =
//     "0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656"
//   const eventSignature =
//     "0x0f0171fffaa54732b1f79a3164b315658061a1a51bf8c1010fbed908a8e333f9"
//   const legacyTxReceipt = await provider.getTransactionReceipt(legacyTxHash)

//   const legacyEvents = legacyTxReceipt.logs
//     .filter((log) => log.topics[0] === eventSignature)
//     .map((legacyEvent) => {
//       const parsedArgs = {
//         stakingProvider: ethers.utils.getAddress(
//           "0x" + legacyEvent.topics[1].slice(-40)
//         ),
//         application: ethers.utils.getAddress(
//           "0x" + legacyEvent.topics[2].slice(-40)
//         ),
//         fromAmount: ethers.BigNumber.from(legacyEvent.data.slice(0, 66)),
//         toAmount: ethers.BigNumber.from("0x" + legacyEvent.data.slice(66)),
//       }

//       return {
//         ...legacyEvent,
//         args: parsedArgs,
//       } as unknown as ethers.Event
//     })

//   return legacyEvents
// }

calculateRequirements()
