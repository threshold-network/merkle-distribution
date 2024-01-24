import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethers"
import axios from "axios"
import {
  OPERATORS_SEARCH_QUERY_STEP,
  QUERY_RESOLUTION,
  HUNDRED,
  PRECISION,
  ALLOWED_UPGRADE_DELAY,
} from "./rewards-constants"
import { InstanceParams } from "./types"

export class Utils {
  prometheusAPI: string
  prometheusAPIQuery: string
  prometheusJob: string
  offset: number
  endRewardsTimestamp: number
  requiredUptime: number
  requiredPreParams: number

  constructor(
    prometheusApi: string,
    prometheusAPIQuery: string,
    prometheusJob: string,
    offset: number,
    endRewardsTimestamp: number,
    requireUptime: number,
    requiredPreParams: number
  ) {
    this.prometheusAPI = prometheusApi
    this.prometheusAPIQuery = prometheusAPIQuery
    this.prometheusJob = prometheusJob
    this.offset = offset
    this.endRewardsTimestamp = endRewardsTimestamp
    this.requiredUptime = requireUptime
    this.requiredPreParams = requiredPreParams
  }

  public async getAuthorization(
    application: Contract,
    intervalEvents: any[],
    postIntervalEvents: any[],
    stakingProvider: string,
    startRewardsBlock: number,
    endRewardsBlock: number,
    currentBlockNumber: number
  ) {
    if (intervalEvents.length > 0) {
      return this.authorizationForRewardsInterval(
        intervalEvents,
        startRewardsBlock,
        endRewardsBlock
      )
    }

    // Events that were emitted between the [end:firstEventDate|currentDate] dates.
    // This is used to fetch the authorization that was set during the rewards
    // interval.
    return await this.authorizationPostRewardsInterval(
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
  public authorizationForRewardsInterval(
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
  public async authorizationPostRewardsInterval(
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

  public async instancesForOperator(
    operatorAddress: any,
    rewardsInterval: number,
    instancesData: Map<string, InstanceParams>
  ) {
    // Resolution is defaulted to Prometheus settings.
    const instancesDataByOperatorParams = {
      query: `present_over_time(up{chain_address="${operatorAddress}", job="${this.prometheusJob}"}
                [${rewardsInterval}s] offset ${this.offset}s)`,
    }
    const instancesDataByOperator = (
      await this.queryPrometheus(
        this.prometheusAPIQuery,
        instancesDataByOperatorParams
      )
    ).data.result

    instancesDataByOperator.forEach(
      (element: { metric: { instance: string } }) => {
        const instanceData = {}
        instancesData.set(
          element.metric.instance,
          instanceData as InstanceParams
        )
      }
    )
  }

  // Peer uptime requirement. The total uptime for all the instances for a given
  // operator has to be greater than 96% to receive the rewards.
  public async checkUptime(
    operatorAddress: string,
    rewardsInterval: number,
    instancesData: Map<string, InstanceParams>
  ) {
    const paramsOperatorUptime = {
      query: `up{chain_address="${operatorAddress}", job="${this.prometheusJob}"}
            [${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${this.offset}s`,
    }

    const instances = (
      await this.queryPrometheus(this.prometheusAPIQuery, paramsOperatorUptime)
    ).data.result

    // First registered 'up' metric in a given interval <start:end> for a given
    // operator. Start evaluating uptime from this point.
    const firstRegisteredUptime = instances.reduce(
      (currentMin: number, instance: any) =>
        Math.min(instance.values[0][0], currentMin),
      Number.MAX_VALUE
    )

    let uptimeSearchRange = this.endRewardsTimestamp - firstRegisteredUptime

    const paramsSumUptimes = {
      query: `sum_over_time(up{chain_address="${operatorAddress}", job="${this.prometheusJob}"}
            [${uptimeSearchRange}s:${QUERY_RESOLUTION}s] offset ${this.offset}s)
            * ${QUERY_RESOLUTION} / ${uptimeSearchRange}`,
    }

    const uptimesByInstance = (
      await this.queryPrometheus(this.prometheusAPIQuery, paramsSumUptimes)
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

    const isUptimeSatisfied = sumUptime >= this.requiredUptime

    const uptimeCoefficient = isUptimeSatisfied
      ? uptimeSearchRange / rewardsInterval
      : 0
    return { uptimeCoefficient, isUptimeSatisfied }
  }

  public async checkPreParams(
    operatorAddress: string,
    rewardsInterval: number,
    dataInstances: Map<string, InstanceParams>
  ) {
    // Avg of pre-params across all the instances for a given operator in the rewards
    // interval dates. Resolution is defaulted to Prometheus settings.
    const paramsPreParams = {
      query: `avg_over_time(tbtc_pre_params_count{chain_address="${operatorAddress}", job="${this.prometheusJob}"}
              [${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${this.offset}s)`,
    }

    const preParamsAvgByInstance = (
      await this.queryPrometheus(this.prometheusAPIQuery, paramsPreParams)
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
    return preParamsAvg >= this.requiredPreParams
  }

  // Query Prometheus and fetch instances that run on either of two latest client
  // versions and mark their first and last registered timestamp.
  public async processBuildVersions(
    operatorAddress: string,
    rewardsInterval: number,
    instancesData: Map<string, InstanceParams>
  ) {
    const buildVersionInstancesParams = {
      query: `client_info{chain_address="${operatorAddress}", job="${this.prometheusJob}"}[${rewardsInterval}s:${QUERY_RESOLUTION}s] offset ${this.offset}s`,
    }
    // Get instances data for a given rewards interval
    const queryBuildVersionInstances = (
      await this.queryPrometheus(
        this.prometheusAPIQuery,
        buildVersionInstancesParams
      )
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

  public convertToObject(map: Map<string, InstanceParams>) {
    let obj: { [k: string]: any } = {}
    map.forEach((value: InstanceParams, key: string) => {
      obj[key] = value
    })

    return obj
  }

  public async queryPrometheus(url: string, params: any): Promise<any> {
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

  public async getBootstrapData(
    startRewardsTimestamp: number,
    endRewardsTimestamp: number
  ) {
    // Query for bootstrap data that has peer instances grouped by operators
    const queryBootstrapData = `${this.prometheusAPI}/query_range`
    const paramsBootstrapData = {
      query: `sum by(chain_address)({job='${this.prometheusJob}'})`,
      start: startRewardsTimestamp,
      end: endRewardsTimestamp,
      step: OPERATORS_SEARCH_QUERY_STEP,
    }

    const bootstrapData = await this.queryPrometheus(
      queryBootstrapData,
      paramsBootstrapData
    )
    return bootstrapData.data.result
  }

  public async isVersionSatisfied(
    operatorAddress: string,
    rewardsInterval: number,
    startRewardsTimestamp: number,
    endRewardsTimestamp: number,
    clientReleases: any,
    instancesData: Map<string, InstanceParams>
  ) {
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

    const instances = await this.processBuildVersions(
      operatorAddress,
      rewardsInterval,
      instancesData
    )

    let isVersionSatisfied = true
    const upgradeCutoffDate = latestClientTagTimestamp + ALLOWED_UPGRADE_DELAY
    if (upgradeCutoffDate < startRewardsTimestamp) {
      // E.g. Feb interval
      // ---older eligible tags---|----------latest tag only--------------|
      // ---|---------------------|---------|-----------------------------|--->
      // latest tag             cutoff     Feb1                         Feb28

      // All the instances must run on the latest version during the rewards
      // interval in Feb.
      for (let i = 0; i < instances.length; i++) {
        if (instances[i].buildVersion != latestClientTag) {
          isVersionSatisfied = false
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
          isVersionSatisfied = false
          // No need to check further since at least one instance run on the
          // older version after the cutoff day.
          break
        } else {
          // It might happen that a node operator stopped an instance before the
          // upgrade cutoff date that happens to be right before the interval
          // end date. However, it might still be eligible for rewards because
          // of the uptime requirement.
          if (!eligibleClientTags.includes(instances[i].buildVersion)) {
            isVersionSatisfied = false
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
          isVersionSatisfied = false
          // No need to check other instances because at least one instance run
          // on a version that is no longer eligible in this rewards interval.
          break
        }
      }
    }

    return isVersionSatisfied
  }
}
