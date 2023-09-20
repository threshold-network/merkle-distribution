import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethers"
import axios from "axios"
import { PRECISION, QUERY_RESOLUTION, HUNDRED } from "./rewards-constants"
import { InstanceParams } from "./types"

export class Utils {
  prometheusAPIQuery: string
  prometheusJob: string
  offset: number
  endRewardsTimestamp: number
  requiredUptime: number
  october17Timestamp: number
  requiredPreParams: number

  constructor(
    prometheusAPIQuery: string,
    prometheusJob: string,
    offset: number,
    endRewardsTimestamp: number,
    requireUptime: number,
    october17Timestamp: number,
    requiredPreParams: number
  ) {
    this.prometheusAPIQuery = prometheusAPIQuery
    this.prometheusJob = prometheusJob
    this.offset = offset
    this.endRewardsTimestamp = endRewardsTimestamp
    this.requiredUptime = requireUptime
    this.october17Timestamp = october17Timestamp
    this.requiredPreParams = requiredPreParams
  }

  public async getAuthorization(
    application: Contract,
    intervalEvents: any[],
    postIntervalEvents: any[],
    stakingProvider: string,
    startRewardsBlock: number,
    endRewardsBlock: number,
    october17Block: number,
    currentBlockNumber: number
  ) {
    if (intervalEvents.length > 0) {
      return this.authorizationForRewardsInterval(
        intervalEvents,
        startRewardsBlock,
        endRewardsBlock,
        october17Block
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
  // October 2022 is a special month for rewards calculation.  If a node was set
  // after Oct 1 but prior to Oct 17, then we calculate the rewards for the entire
  // month.
  // See https://blog.threshold.network/tbtc-v2-hits-its-first-launch-milestone/
  // E.g. 1
  // First and only event was on Oct 10. The authorization is calculated for the
  // entire month.
  // E.g. 2
  // First increase event was on Oct 10 from 0 to 100k
  // Second increase was on Oct 15 from 100k to 150k
  // Authorization of 100k is interpolated for the dates between Oct 1 - Oct 10
  // Authorization for Oct 1 - Oct 15 is now 100k; coefficient 15/30
  // Authorization between Oct 15 - Oct 30 is 150k; coefficent 15/30
  // Weighted authorization: 15/30 * 100k + 15/30 * 150k
  public authorizationForRewardsInterval(
    intervalEvents: any[],
    startRewardsBlock: number,
    endRewardsBlock: number,
    october17Block: number
  ) {
    let authorization = BigNumber.from("0")
    const deltaRewardsBlock = endRewardsBlock - startRewardsBlock
    // ascending order
    intervalEvents.sort((a, b) => a.blockNumber - b.blockNumber)

    let tmpBlock = startRewardsBlock // prev tmp block
    let firstEventBlock = intervalEvents[0].blockNumber

    let index = 0
    if (firstEventBlock < october17Block) {
      index = 1
    }

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
    // October is a special month for rewards calculation. If a node was set before
    // October 17th, then it is eligible for the entire month of rewards. Uptime of
    // a running node still need to meet the uptime requirement after it was set.
    if (firstRegisteredUptime < this.october17Timestamp) {
      uptimeSearchRange = rewardsInterval
    }

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
}
