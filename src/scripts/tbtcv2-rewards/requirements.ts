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
import axios from "axios"
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
  QUERY_RESOLUTION,
  HUNDRED,
} from "./rewards-constants"

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

type InstanceParams = {
  upTimePercent: number
  avgPreParams: number
  version: any
}

export async function calculateRewards() {
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
    await queryPrometheus(queryBootstrapData, paramsBootstrapData)
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

    const beaconAuthorization = await getAuthorization(
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

    const tbtcAuthorization = await getAuthorization(
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
    await instancesForOperator(operatorAddress, rewardsInterval, instancesData)

    /// Uptime requirement
    let { uptimeCoefficient, isUptimeSatisfied } = await checkUptime(
      operatorAddress,
      rewardsInterval,
      instancesData
    )
    // BigNumbers cannot operate on floats. Coefficient needs to be multiplied
    // by PRECISION
    uptimeCoefficient = Math.floor(uptimeCoefficient * PRECISION)
    requirements.set(IS_UP_TIME_SATISFIED, isUptimeSatisfied)

    /// Pre-params requirement
    const isPrePramsSatisfied = await checkPreParams(
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

    const eligibleClientTags = [latestClientTag, secondToLatestClientTag]

    if (clientReleases.length == 3) {
      const thirdToLatestClient = clientReleases[2].split("_")
      const thirdToLatestClientTag = thirdToLatestClient[0]
      eligibleClientTags.push(thirdToLatestClientTag)
    }

    const instances = await processBuildVersions(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    const upgradeCutoffDate = latestClientTagTimestamp + ALLOWED_UPGRADE_DELAY
    requirements.set(IS_VERSION_SATISFIED, true)
    if (upgradeCutoffDate < startRewardsTimestamp) {
      // E.g. Feb interval
      // ---older eligible tags---|----------latest tag only--------------|
      // ---|---------------------|---------|-----------------------------|--->
      // latest tag             cutoff     Feb1                         Feb28

      // All the instances must run on the latest version during the rewards
      // interval in Feb.
      for (let i = 0; i < instances.length; i++) {
        if (instances[i].buildVersion != latestClientTag) {
          requirements.set(IS_VERSION_SATISFIED, false)
        }
      }
    } else if (upgradeCutoffDate < endRewardsTimestamp) {
      // E.g. Feb interval
      // -----older eligible tags-----|----latest tag only----|
      // ----|---------|--------------|-----------------------|--->
      // latest tag   Feb1          cutoff                   Feb28

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
          if (!eligibleClientTags.includes(instances[i].buildVersion)) {
            requirements.set(IS_VERSION_SATISFIED, false)
            // No need to check other instances because at least one instance run
            // on the older version than 2 latest allowed.
            break
          }
        }
      }
    } else {
      // E.g. Feb interval
      // ---older eligible tags----|-----older or latest tag----|---latest tag only--->
      // --|-----------------------|---------------|------------|-->
      //  Feb1                latest tag         Feb28        cutoff

      // For simplicity purposes all the instances can run on any of the eligible
      // versions.
      for (let i = instances.length - 1; i >= 0; i--) {
        if (!eligibleClientTags.includes(instances[i].buildVersion)) {
          requirements.set(IS_VERSION_SATISFIED, false)
          // No need to check other instances because at least one instance run
          // on a version that is no longer eligible in this rewards interval.
          break
        }
      }
    }

    operatorData[stakingProvider] = {
      applications: Object.fromEntries(authorizations),
      instances: convertToObject(instancesData),
      requirements: Object.fromEntries(requirements),
    }

    operatorsData.push(operatorData)
  }

  fs.writeFileSync(outputFile, JSON.stringify(operatorsData, null, 4))
}

async function getAuthorization(
  application: Contract,
  intervalEvents: any[],
  postIntervalEvents: any[],
  stakingProvider: string,
  startRewardsBlock: number,
  endRewardsBlock: number,
  currentBlockNumber: number
) {
  if (intervalEvents.length > 0) {
    return authorizationForRewardsInterval(
      intervalEvents,
      startRewardsBlock,
      endRewardsBlock
    )
  }

  // Events that were emitted between the [end:firstEventDate|currentDate] dates.
  // This is used to fetch the authorization that was set during the rewards
  // interval.
  return await authorizationPostRewardsInterval(
    postIntervalEvents,
    application,
    stakingProvider,
    currentBlockNumber
  )
}

// Calculates the weighted authorization for rewards interval based on events.
// The general idea of weighted rewards calculation describes the following example.
// Please note that this example operates on dates for simplicity purposes,
// however the actual calculation is based on block numbers.
// Ex.
// events:         ^     ^      *    *   ^
// timeline:  -|---|-----|------|----|---|--------|-->
//         Sep 0   3     8      14  18   22       30
// where: '^' denotes increase in authorization
//        '*' denotes decrease in authorization
//         0 -> Sep 1 at 00:00:00
// event authorizations:
//  Sep 0 - 3 from 100k to 110k
//  Sep 3 - 8 from 110k to 135k
//  Sep 8 - 14 from 135k to 120k
//  Sep 14 - 18 from 120k to 100k
//  Sep 18 - 30 constant 100k (last sub-interval)
// Weighted authorization = (3-0)/30*100 + (8-3)/30*110 + (14-8)/30*135
//                        + (18-14)/30*120 + (30-18)/30*100
function authorizationForRewardsInterval(
  intervalEvents: any[],
  startRewardsBlock: number,
  endRewardsBlock: number
) {
  let authorization = BigNumber.from("0")
  const deltaRewardsBlock = endRewardsBlock - startRewardsBlock
  // ascending order
  intervalEvents.sort((a, b) => a.blockNumber - b.blockNumber)

  let tmpBlock = startRewardsBlock // prev tmp block

  let index = 0

  for (let i = index; i < intervalEvents.length; i++) {
    const eventBlock = intervalEvents[i].blockNumber
    const coefficient = Math.floor(
      ((eventBlock - tmpBlock) / deltaRewardsBlock) * PRECISION
    )
    authorization = authorization.add(
      intervalEvents[i].args.fromAmount.mul(coefficient)
    )
    tmpBlock = eventBlock
  }

  // calculating authorization for the last sub-interval
  const coefficient = Math.floor(
    ((endRewardsBlock - tmpBlock) / deltaRewardsBlock) * PRECISION
  )
  authorization = authorization.add(
    intervalEvents[intervalEvents.length - 1].args.toAmount.mul(coefficient)
  )

  return authorization.div(PRECISION)
}

// Get the authorization from the first event that occurred after the rewards
// interval. If no events were emitted, then get the authorization from the current
// block.
async function authorizationPostRewardsInterval(
  postIntervalEvents: any[],
  application: Contract,
  stakingProvider: string,
  currentBlockNumber: number
) {
  // Sort events in ascending order
  postIntervalEvents.sort((a, b) => a.blockNumber - b.blockNumber)

  if (
    postIntervalEvents.length > 0 &&
    postIntervalEvents[0].blockNumber < currentBlockNumber
  ) {
    // There are events (increase or decrease) present after the rewards interval
    // and before the current block. Take the "fromAmount", because it was the
    // same as for the rewards interval dates.
    return postIntervalEvents[0].args.fromAmount
  }

  // There were no authorization events after the rewards interval and before
  // the current block.
  // Current authorization is the same as the authorization at the end of the
  // rewards interval.
  const authorization = await application.eligibleStake(stakingProvider)
  return authorization
}

async function instancesForOperator(
  operatorAddress: any,
  rewardsInterval: number,
  instancesData: Map<string, InstanceParams>
) {
  // Resolution is defaulted to Prometheus settings.
  const instancesDataByOperatorParams = {
    query: `present_over_time(up{chain_address="${operatorAddress}", job="${prometheusJob}"}
                [${rewardsInterval}s] offset ${offset}s)`,
  }
  const instancesDataByOperator = (
    await queryPrometheus(prometheusAPIQuery, instancesDataByOperatorParams)
  ).data.result

  instancesDataByOperator.forEach(
    (element: { metric: { instance: string } }) => {
      const instanceData = {}
      instancesData.set(element.metric.instance, instanceData as InstanceParams)
    }
  )
}

// Peer uptime requirement. The total uptime for all the instances for a given
// operator has to be greater than 96% to receive the rewards.
async function checkUptime(
  operatorAddress: string,
  rewardsInterval: number,
  instancesData: Map<string, InstanceParams>
) {
  const paramsOperatorUptime = {
    query: `up{chain_address="${operatorAddress}", job="${prometheusJob}"}
            [${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${offset}s`,
  }

  const instances = (
    await queryPrometheus(prometheusAPIQuery, paramsOperatorUptime)
  ).data.result

  // First registered 'up' metric in a given interval <start:end> for a given
  // operator. Start evaluating uptime from this point.
  const firstRegisteredUptime = instances.reduce(
    (currentMin: number, instance: any) =>
      Math.min(instance.values[0][0], currentMin),
    Number.MAX_VALUE
  )

  let uptimeSearchRange = endRewardsTimestamp - firstRegisteredUptime

  const paramsSumUptimes = {
    query: `sum_over_time(up{chain_address="${operatorAddress}", job="${prometheusJob}"}
            [${uptimeSearchRange}s:${QUERY_RESOLUTION}s] offset ${offset}s)
            * ${QUERY_RESOLUTION} / ${uptimeSearchRange}`,
  }

  const uptimesByInstance = (
    await queryPrometheus(prometheusAPIQuery, paramsSumUptimes)
  ).data.result

  let sumUptime = 0
  for (let i = 0; i < uptimesByInstance.length; i++) {
    const instance = uptimesByInstance[i]
    const uptime = instance.value[1] * HUNDRED
    const dataInstance = instancesData.get(instance.metric.instance)
    if (dataInstance !== undefined) {
      dataInstance.upTimePercent = uptime
    } else {
      // Should not happen
      console.error("Instance must be present for a given rewards interval.")
    }

    sumUptime += uptime
  }

  const isUptimeSatisfied = sumUptime >= requiredUptime

  const uptimeCoefficient = isUptimeSatisfied
    ? uptimeSearchRange / rewardsInterval
    : 0
  return { uptimeCoefficient, isUptimeSatisfied }
}

async function checkPreParams(
  operatorAddress: string,
  rewardsInterval: number,
  dataInstances: Map<string, InstanceParams>
) {
  // Avg of pre-params across all the instances for a given operator in the rewards
  // interval dates. Resolution is defaulted to Prometheus settings.
  const paramsPreParams = {
    query: `avg_over_time(tbtc_pre_params_count{chain_address="${operatorAddress}", job="${prometheusJob}"}
              [${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${offset}s)`,
  }

  const preParamsAvgByInstance = (
    await queryPrometheus(prometheusAPIQuery, paramsPreParams)
  ).data.result

  let sumPreParams = 0
  for (let i = 0; i < preParamsAvgByInstance.length; i++) {
    const instance = preParamsAvgByInstance[i]
    const preParams = parseInt(instance.value[1]) // [timestamp, value]
    const dataInstance = dataInstances.get(instance.metric.instance)
    if (dataInstance !== undefined) {
      dataInstance.avgPreParams = preParams
    } else {
      // Should not happen
      console.error("Instance must be present for a given rewards interval.")
    }

    sumPreParams += preParams
  }

  const preParamsAvg = sumPreParams / preParamsAvgByInstance.length
  return preParamsAvg >= requiredPreParams
}

// Query Prometheus and fetch instances that run on either of two latest client
// versions and mark their first and last registered timestamp.
async function processBuildVersions(
  operatorAddress: string,
  rewardsInterval: number,
  instancesData: Map<string, InstanceParams>
) {
  const buildVersionInstancesParams = {
    query: `client_info{chain_address="${operatorAddress}", job="${prometheusJob}"}[${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${offset}s`,
  }
  // Get instances data for a given rewards interval
  const queryBuildVersionInstances = (
    await queryPrometheus(prometheusAPIQuery, buildVersionInstancesParams)
  ).data.result

  let instances = []
  const lastRegisteredVersion = new Map<string, string>() // version -> last registered timestamp

  // Determine client's build version for it all it's instances
  for (let i = 0; i < queryBuildVersionInstances.length; i++) {
    const instance = queryBuildVersionInstances[i]

    const instanceTimestampsVersionInfo = {
      // First timestamp registered by Prometheus for a given instance
      firstRegisteredTimestamp: instance.values[0][0],
      // Last timestamp registered by Prometheus for a given instance
      lastRegisteredTimestamp: instance.values[instance.values.length - 1][0],
      buildVersion: instance.metric.version,
    }

    instances.push(instanceTimestampsVersionInfo)

    const dataInstance = instancesData.get(instance.metric.instance)
    lastRegisteredVersion.set(
      instanceTimestampsVersionInfo.buildVersion,
      instanceTimestampsVersionInfo.lastRegisteredTimestamp
    )
    if (dataInstance !== undefined) {
      dataInstance.version = Object.fromEntries(lastRegisteredVersion)
    } else {
      // Should not happen
      console.error("Instance must be present for a given rewards interval.")
    }
  }

  // Sort instances in ascending order by first registration timestamp
  instances.sort((a, b) =>
    a.firstRegisteredTimestamp > b.firstRegisteredTimestamp ? 1 : -1
  )

  return instances
}

function convertToObject(map: Map<string, InstanceParams>) {
  let obj: { [k: string]: any } = {}
  map.forEach((value: InstanceParams, key: string) => {
    obj[key] = value
  })

  return obj
}

async function queryPrometheus(url: string, params: any): Promise<any> {
  try {
    const { data } = await axios.get(url, { params: params })

    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message)
      return error.message
    } else {
      console.log("unexpected error: ", error)
      return "An unexpected error occurred"
    }
  }
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

calculateRewards()
