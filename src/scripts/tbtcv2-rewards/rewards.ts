import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethers"
import { program } from "commander"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
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
  PRECISION,
  OPERATORS_SEARCH_QUERY_STEP,
  QUERY_RESOLUTION,
  HUNDRED,
  APR,
  SECONDS_IN_YEAR,
} from "./rewards-constants"

dayjs.extend(utc)

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
    "-v, --valid-versions <valid versions string>",
    "valid versions string"
  )
  .requiredOption("-n, --network <name>", "network name")
  .requiredOption("-o, --output <file>", "output JSON file")
  .requiredOption(
    "-d, --output-details-path <path>",
    "output JSON details path"
  )
  .requiredOption("-q, --required-pre-params <number>", "required pre params")
  .requiredOption("-m, --required-uptime <percent>", "required uptime")
  .parse(process.argv)

// Parse the program options
const options = program.opts()
const prometheusJob = options.job
const prometheusAPI = options.api
const clientVersions = options.validVersions.split("|") // sorted from latest to oldest
const startRewardsTimestamp = parseInt(options.startTimestamp)
const endRewardsTimestamp = parseInt(options.endTimestamp)
const startRewardsBlock = parseInt(options.startBlock)
const endRewardsBlock = parseInt(options.endBlock)
const rewardsDataOutput = options.output
const rewardsDetailsPath = options.outputDetailsPath
const network = options.network
const requiredPreParams = options.requiredPreParams
const requiredUptime = options.requiredUptime // percent

const prometheusAPIQuery = `${prometheusAPI}/query`
// Go back in time relevant to the current date to get data for the exact
// rewards interval dates.
const offset = Math.floor(Date.now() / 1000) - endRewardsTimestamp

// Convert epoch timestamp to YYYY-MM-DD for your distributions folder.
const startDate = dayjs.unix(startRewardsTimestamp).utc().format("YYYY-MM-DD")
// e.g. "2025-01-01"
const lastDistributionPath = `distributions/${startDate}`

const merkleDistFile = `${lastDistributionPath}/MerkleDist.json`
let oldOperatorsSet = new Set<string>()

// Load the old distribution's MerkleDist if it exists
if (fs.existsSync(merkleDistFile)) {
  const merkleDistData = JSON.parse(fs.readFileSync(merkleDistFile, "utf-8"))
  // merkleDistData.claims = { "0xOperator1": {...}, "0xOperator2": {...}, ... }
  const oldOperators = Object.keys(merkleDistData.claims) // array of addresses
  oldOperatorsSet = new Set(oldOperators.map((addr) => addr.toLowerCase()))
  console.log(
    `Loaded ${oldOperatorsSet.size} old operators from ${merkleDistFile}.`
  )
} else {
  console.log(`WARNING: No MerkleDist.json found at ${merkleDistFile}`)
}

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
  // periodic rate rounded and adjusted because BigNumber can't operate on floating numbers.
  const periodicRate = Math.round(
    APR * (rewardsInterval / SECONDS_IN_YEAR) * PRECISION
  )
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
  const rewardsData: any = {}

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

  for (let i = 0; i < bootstrapData.length; i++) {
    const operatorAddress = bootstrapData[i].metric.chain_address
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
    const { beneficiary } = await tokenStaking.rolesOf(stakingProvider)

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

    const validVersions = clientVersions.map((client: string) => {
      return { version: client.split("_")[0], deadline: client.split("_")[1] }
    })

    const validVersionsNames = validVersions.map(
      (validVersion: any) => validVersion.version
    )

    const instances = await processBuildVersions(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    requirements.set(IS_VERSION_SATISFIED, true)

    // if there is only one valid version, all the instances must run on it
    if (validVersions.length === 1) {
      for (let i = 0; i < instances.length; i++) {
        if (
          !checkMinorVersion(
            validVersions[0].version,
            instances[i].buildVersion
          )
        ) {
          requirements.set(IS_VERSION_SATISFIED, false)
        }
      }
    } else if (validVersions.length > 1) {
      // for simplicity purposes, if there is several deadlines, upgradeCutoffDate is the
      // least restrictive deadline.
      const upgradeCutoffDate = validVersions[1].deadline
      const latestClientTag = validVersions[0].version

      // if we have more than one valid version, we need to check if the instances did the update
      // before the cutoff date
      //
      // E.g. Feb interval
      // -----older eligible tags-----|----latest tag only----|
      // ----|---------|--------------|-----------------------|--->
      // latest tag   Feb1          cutoff                   Feb28
      if (upgradeCutoffDate < endRewardsTimestamp) {
        // All the instances between (upgradeCutoffDate : endRewardsTimestamp]
        // must run on the latest version
        for (let i = instances.length - 1; i >= 0; i--) {
          if (
            instances[i].lastRegisteredTimestamp > upgradeCutoffDate &&
            !checkMinorVersion(latestClientTag, instances[i].buildVersion)
          ) {
            // After the cutoff day a node operator still run an instance with an
            // invalid version. No rewards.
            requirements.set(IS_VERSION_SATISFIED, false)
            // No need to check further since at least one instance run on the
            // older version after the cutoff day.
            break
          } else {
            // It might happen that a node operator stopped an instance before the
            // upgrade cutoff date that happens to be right before the interval
            // end date. However, it might still be eligible for rewards because
            // of the uptime requirement.
            // So it is still necessary to check if the instance is on valid versions list
            if (
              !validVersionsNames.some((version: string) =>
                checkMinorVersion(version, instances[i].buildVersion)
              )
            ) {
              requirements.set(IS_VERSION_SATISFIED, false)
              // No need to check other instances because at least one instance run
              // on a version that is no longer eligible in this rewards interval.
              break
            }
          }
        }
      } else {
        // E.g. Feb interval
        // ---older eligible tags----|-----older or latest tag----|---latest tag only--->
        // --|-----------------------|---------------|------------|-->
        //  Feb1                latest tag         Feb28        cutoff

        // For simplicity purposes all the instances can run on any of the eligible versions
        for (let i = instances.length - 1; i >= 0; i--) {
          if (
            !validVersionsNames.some((version: string) =>
              checkMinorVersion(version, instances[i].buildVersion)
            )
          ) {
            requirements.set(IS_VERSION_SATISFIED, false)
            // No need to check other instances because at least one instance run
            // on a version that is no longer eligible in this rewards interval.
            break
          }
        }
      }
    }

    /// Start assembling peer data and weighted authorizations
    operatorData[stakingProvider] = {
      applications: Object.fromEntries(authorizations),
      instances: convertToObject(instancesData),
      requirements: Object.fromEntries(requirements),
    }

    if (
      requirements.get(IS_BEACON_AUTHORIZED) &&
      requirements.get(IS_TBTC_AUTHORIZED) &&
      requirements.get(IS_UP_TIME_SATISFIED) &&
      requirements.get(IS_PRE_PARAMS_SATISFIED) &&
      requirements.get(IS_VERSION_SATISFIED)
    ) {
      const beacon = BigNumber.from(authorizations.get(BEACON_AUTHORIZATION))
      const tbct = BigNumber.from(authorizations.get(TBTC_AUTHORIZATION))
      let minApplicationAuthorization = beacon
      if (beacon.gt(tbct)) {
        minApplicationAuthorization = tbct
      }

      rewardsData[stakingProvider] = {
        beneficiary: beneficiary,
        // amount = min(beaconWeightedAuthorization, tbtcWeightedAuthorization) * clientUptimeCoefficient * periodicRate
        amount: minApplicationAuthorization
          .mul(uptimeCoefficient)
          .mul(periodicRate)
          .div(PRECISION) // coefficient was multiplied by PRECISION earlier
          .div(PRECISION) // APR was multiplied by PRECISION earlier
          .div(HUNDRED) // APR is in %
          .toString(),
      }
    }

    operatorsData.push(operatorData)
  }

  fs.writeFileSync(rewardsDataOutput, JSON.stringify(rewardsData, null, 4))
  const detailsFileName = `${startRewardsTimestamp}-${endRewardsTimestamp}`
  fs.writeFileSync(
    rewardsDetailsPath + "/" + detailsFileName + ".json",
    JSON.stringify(operatorsData, null, 4)
  )
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
  let firstRegisteredUptime = instances.reduce(
    (currentMin: number, instance: any) =>
      Math.min(instance.values[0][0], currentMin),
    Number.MAX_VALUE
  )

  // If the operator is in last distribution, we treat them as continuing
  // => They must be measured from the *start* of the period, not from their first heartbeat.
  if (oldOperatorsSet.has(operatorAddress.toLowerCase())) {
    firstRegisteredUptime = startRewardsTimestamp
  }

  let uptimeSearchRange = endRewardsTimestamp - firstRegisteredUptime
  if (uptimeSearchRange < 0) {
    uptimeSearchRange = 0 // means they came online after period end, effectively 0
  }

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

// Check if client version has the same major and minor than base version
function checkMinorVersion(baseVersion: string, clientVersion: string) {
  const minorBase = baseVersion.match(/[0-9]+\.[0-9]+/g)
  const regex = new RegExp(`v${minorBase}\\.[0-9]+$`)
  return regex.test(clientVersion)
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

calculateRewards()
