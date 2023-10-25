// 3 weeks in sec (default value) + we add 20 days because the -m6 release was
// announced 20 days after the tag was created. This applies only for the October
// and November rewards interval (cutoff date for -m6 is Nov 15).
export const ALLOWED_UPGRADE_DELAY = 3542400
export const OPERATORS_SEARCH_QUERY_STEP = 600 // 10min in sec
export const IS_BEACON_AUTHORIZED = "isBeaconAuthorized"
export const BEACON_AUTHORIZATION = "beaconAuthorization"
export const IS_TBTC_AUTHORIZED = "isTbtcAuthorized"
export const TBTC_AUTHORIZATION = "tbtcAuthorization"
export const IS_UP_TIME_SATISFIED = "isUptimeSatisfied"
export const IS_PRE_PARAMS_SATISFIED = "isPreParamsSatisfied"
export const PRECISION = 1000000
export const QUERY_RESOLUTION = 60 // 1min sampling time for the metrics
export const HUNDRED = 100
export const IS_VERSION_SATISFIED = "isVersionSatisfied"
export const APR = 15 // percent
export const SECONDS_IN_YEAR = 31536000
