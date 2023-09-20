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
  ALLOWED_UPGRADE_DELAY,
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
    "-c, --october17-block <october 17 block>",
    "october 17 block"
  )
  .requiredOption(
    "-t, --october17-timestamp <october 17 timestamp>",
    "october 17 timestamp"
  )
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
const october17Block = parseInt(options.october17Block)
const october17Timestamp = parseInt(options.october17Timestamp)
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
  prometheusAPIQuery,
  prometheusJob,
  offset,
  endRewardsTimestamp,
  requiredUptime,
  october17Timestamp,
  requiredPreParams
)

export async function calculateRequirements() {
  if (Date.now() / 1000 < endRewardsTimestamp) {
    console.log("End time interval must be in the past")
    return "End time interval must be in the past"
  }

  console.log("*** Calculating Requirements ***")

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

  operatorsData.push({
    requiredUptimePercent: requiredUptime,
    startTimestamp: startRewardsTimestamp,
    endTimestamp: endRewardsTimestamp,
    startBlock: startRewardsBlock,
    endBlock: endRewardsBlock,
  })

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
  const intervalAuthorizationDecreasedEvents = await tokenStaking.queryFilter(
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
    "Fetching AuthorizationDecreased events after rewards interval..."
  )
  const postIntervalAuthorizationDecreasedEvents =
    await tokenStaking.queryFilter(
      "AuthorizationDecreaseApproved",
      endRewardsBlock,
      currentBlockNumber
    )

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
      october17Block,
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
      october17Block,
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

    // keep-core client already has at least 2 released versions
    const latestClient = clientReleases[0].split("_")
    const latestClientTag = latestClient[0]
    const latestClientTagTimestamp = Number(latestClient[1])
    const secondToLatestClient = clientReleases[1].split("_")
    const secondToLatestClientTag = secondToLatestClient[0]

    const instances = await utils.processBuildVersions(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    const upgradeCutoffDate = latestClientTagTimestamp + ALLOWED_UPGRADE_DELAY
    requirements.set(IS_VERSION_SATISFIED, true)
    if (upgradeCutoffDate < startRewardsTimestamp) {
      // v1-|-------v1 or v2------|------------------v2 only--------------|
      // ---|---------------------|---------|-----------------------------|--->
      //  v2tag                 cutoff     Feb1                          Feb28
      // All the instances must run on the latest version during the rewards
      // interval in Feb.
      for (let i = 0; i < instances.length; i++) {
        if (instances[i].buildVersion != latestClientTag) {
          requirements.set(IS_VERSION_SATISFIED, false)
        }
      }
    } else if (upgradeCutoffDate < endRewardsTimestamp) {
      // -v1-|-------v1 or v2---------|--------v2 only--------|
      // ----|---------|--------------|-----------------------|--->
      //   v2tag     Feb1          cutoff                  Feb28
      // All the instances between (upgradeCutoffDate : endRewardsTimestamp]
      // must run on the latest version
      for (let i = instances.length - 1; i >= 0; i--) {
        if (
          instances[i].lastRegisteredTimestamp > upgradeCutoffDate &&
          !instances[i].buildVersion.includes(latestClientTag)
        ) {
          // After the cutoff day a node operator still run an instance with an
          // older version. No rewards.
          requirements.set(IS_VERSION_SATISFIED, false)
          // No need to check further since at least one instance run on the
          // older version after the cutoff day.
          break
        } else {
          // It might happen that a node operator stopped an instance before the
          // upgrade cutoff date that happens to be right before the interval
          // end date. However, it might still be eligible for rewards because
          // of the uptime requirement.
          if (
            !(
              instances[i].buildVersion.includes(latestClientTag) ||
              instances[i].buildVersion.includes(secondToLatestClientTag)
            )
          ) {
            // Instance run on the older version than 2 latest.
            requirements.set(IS_VERSION_SATISFIED, false)
          }
          // No need to check other instances.
          break
        }
      }
    } else {
      // ------------v1------------|-----------v1 or v2---------|---v2 only--->
      // --|-----------------------|---------------|------------|-->
      //  Feb1                   v2tag           Feb28        cutoff
      // All the instances between [latestClientTagTimestamp : endRewardsTimestamp]
      // must run either on secondToLatest or the latest version
      for (let i = instances.length - 1; i >= 0; i--) {
        if (instances[i].lastRegisteredTimestamp >= latestClientTagTimestamp) {
          if (
            !(
              instances[i].buildVersion.includes(latestClientTag) ||
              instances[i].buildVersion.includes(secondToLatestClientTag)
            )
          ) {
            // A client run a version older than 2 latest allowed. No rewards.
            requirements.set(IS_VERSION_SATISFIED, false)
            break
          }
        } else {
          if (!instances[i].buildVersion.includes(secondToLatestClientTag)) {
            requirements.set(IS_VERSION_SATISFIED, false)
          }
          // No need to check other instances before the latestClientTagTimestamp.
          break
        }
      }
    }

    /// Start assembling peer data and weighted authorizations
    operatorData[stakingProvider] = {
      applications: Object.fromEntries(authorizations),
      instances: utils.convertToObject(instancesData),
      requirements: Object.fromEntries(requirements),
    }

    operatorsData.push(operatorData)
  }

  fs.writeFileSync(outputFile, JSON.stringify(operatorsData, null, 4))
}

calculateRequirements()
