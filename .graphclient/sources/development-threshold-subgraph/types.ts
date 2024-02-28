// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace DevelopmentThresholdSubgraphTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
};

/** Account represents the base user data: user's stakes and delegations */
export type Account = {
  /** ID is the account's ETH address */
  id: Scalars['ID'];
  stakes?: Maybe<Array<StakeData>>;
  delegatee?: Maybe<TokenholderDelegation>;
};


/** Account represents the base user data: user's stakes and delegations */
export type AccountstakesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeData_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeData_filter>;
};

export type Account_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  stakes_?: InputMaybe<StakeData_filter>;
  delegatee?: InputMaybe<Scalars['String']>;
  delegatee_not?: InputMaybe<Scalars['String']>;
  delegatee_gt?: InputMaybe<Scalars['String']>;
  delegatee_lt?: InputMaybe<Scalars['String']>;
  delegatee_gte?: InputMaybe<Scalars['String']>;
  delegatee_lte?: InputMaybe<Scalars['String']>;
  delegatee_in?: InputMaybe<Array<Scalars['String']>>;
  delegatee_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegatee_contains?: InputMaybe<Scalars['String']>;
  delegatee_contains_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_contains?: InputMaybe<Scalars['String']>;
  delegatee_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegatee_starts_with?: InputMaybe<Scalars['String']>;
  delegatee_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_starts_with?: InputMaybe<Scalars['String']>;
  delegatee_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_ends_with?: InputMaybe<Scalars['String']>;
  delegatee_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_ends_with?: InputMaybe<Scalars['String']>;
  delegatee_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_?: InputMaybe<TokenholderDelegation_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Account_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Account_filter>>>;
};

export type Account_orderBy =
  | 'id'
  | 'stakes'
  | 'delegatee'
  | 'delegatee__id'
  | 'delegatee__totalWeight'
  | 'delegatee__liquidWeight';

/** AppAuthHistory stores each change in the stake's authorization of apps */
export type AppAuthHistory = {
  /** ID is <staking provider address>-<application address>-<block number> */
  id: Scalars['ID'];
  /** AppAuthorization of this update in the authorization */
  appAuthorization: AppAuthorization;
  /** Amount of total T authorized by staking provider to the application in this block */
  amount: Scalars['BigInt'];
  /** Amount of T that has been increased or decreased */
  eventAmount: Scalars['BigInt'];
  /** Type of event that caused this update */
  eventType: Scalars['String'];
  /** Block in which this authorization update became effective */
  blockNumber: Scalars['BigInt'];
  /** Timestamp in which this authorization update became effective */
  timestamp: Scalars['BigInt'];
};

export type AppAuthHistory_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  appAuthorization?: InputMaybe<Scalars['String']>;
  appAuthorization_not?: InputMaybe<Scalars['String']>;
  appAuthorization_gt?: InputMaybe<Scalars['String']>;
  appAuthorization_lt?: InputMaybe<Scalars['String']>;
  appAuthorization_gte?: InputMaybe<Scalars['String']>;
  appAuthorization_lte?: InputMaybe<Scalars['String']>;
  appAuthorization_in?: InputMaybe<Array<Scalars['String']>>;
  appAuthorization_not_in?: InputMaybe<Array<Scalars['String']>>;
  appAuthorization_contains?: InputMaybe<Scalars['String']>;
  appAuthorization_contains_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_not_contains?: InputMaybe<Scalars['String']>;
  appAuthorization_not_contains_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_starts_with?: InputMaybe<Scalars['String']>;
  appAuthorization_starts_with_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_not_starts_with?: InputMaybe<Scalars['String']>;
  appAuthorization_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_ends_with?: InputMaybe<Scalars['String']>;
  appAuthorization_ends_with_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_not_ends_with?: InputMaybe<Scalars['String']>;
  appAuthorization_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  appAuthorization_?: InputMaybe<AppAuthorization_filter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventAmount?: InputMaybe<Scalars['BigInt']>;
  eventAmount_not?: InputMaybe<Scalars['BigInt']>;
  eventAmount_gt?: InputMaybe<Scalars['BigInt']>;
  eventAmount_lt?: InputMaybe<Scalars['BigInt']>;
  eventAmount_gte?: InputMaybe<Scalars['BigInt']>;
  eventAmount_lte?: InputMaybe<Scalars['BigInt']>;
  eventAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventType?: InputMaybe<Scalars['String']>;
  eventType_not?: InputMaybe<Scalars['String']>;
  eventType_gt?: InputMaybe<Scalars['String']>;
  eventType_lt?: InputMaybe<Scalars['String']>;
  eventType_gte?: InputMaybe<Scalars['String']>;
  eventType_lte?: InputMaybe<Scalars['String']>;
  eventType_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_not_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_contains?: InputMaybe<Scalars['String']>;
  eventType_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_contains?: InputMaybe<Scalars['String']>;
  eventType_not_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_starts_with?: InputMaybe<Scalars['String']>;
  eventType_starts_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_starts_with?: InputMaybe<Scalars['String']>;
  eventType_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_ends_with?: InputMaybe<Scalars['String']>;
  eventType_ends_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<AppAuthHistory_filter>>>;
  or?: InputMaybe<Array<InputMaybe<AppAuthHistory_filter>>>;
};

export type AppAuthHistory_orderBy =
  | 'id'
  | 'appAuthorization'
  | 'appAuthorization__id'
  | 'appAuthorization__appAddress'
  | 'appAuthorization__amount'
  | 'appAuthorization__amountDeauthorizing'
  | 'appAuthorization__appName'
  | 'amount'
  | 'eventAmount'
  | 'eventType'
  | 'blockNumber'
  | 'timestamp';

/** AppAuthorizations represents the stake authorizations to Threshold apps */
export type AppAuthorization = {
  /** ID is <staking provider address>-<application address> */
  id: Scalars['ID'];
  /** Application contract address */
  appAddress: Scalars['Bytes'];
  /** Stake data of the staking provider */
  stake: StakeData;
  /** Amount of total T currently authorized to the application */
  amount: Scalars['BigInt'];
  /** Amount of T that is being deauthorized */
  amountDeauthorizing: Scalars['BigInt'];
  /** Application name (if known) */
  appName?: Maybe<Scalars['String']>;
};

export type AppAuthorization_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  appAddress?: InputMaybe<Scalars['Bytes']>;
  appAddress_not?: InputMaybe<Scalars['Bytes']>;
  appAddress_gt?: InputMaybe<Scalars['Bytes']>;
  appAddress_lt?: InputMaybe<Scalars['Bytes']>;
  appAddress_gte?: InputMaybe<Scalars['Bytes']>;
  appAddress_lte?: InputMaybe<Scalars['Bytes']>;
  appAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  appAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  appAddress_contains?: InputMaybe<Scalars['Bytes']>;
  appAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  stake?: InputMaybe<Scalars['String']>;
  stake_not?: InputMaybe<Scalars['String']>;
  stake_gt?: InputMaybe<Scalars['String']>;
  stake_lt?: InputMaybe<Scalars['String']>;
  stake_gte?: InputMaybe<Scalars['String']>;
  stake_lte?: InputMaybe<Scalars['String']>;
  stake_in?: InputMaybe<Array<Scalars['String']>>;
  stake_not_in?: InputMaybe<Array<Scalars['String']>>;
  stake_contains?: InputMaybe<Scalars['String']>;
  stake_contains_nocase?: InputMaybe<Scalars['String']>;
  stake_not_contains?: InputMaybe<Scalars['String']>;
  stake_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stake_starts_with?: InputMaybe<Scalars['String']>;
  stake_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stake_not_starts_with?: InputMaybe<Scalars['String']>;
  stake_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stake_ends_with?: InputMaybe<Scalars['String']>;
  stake_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stake_not_ends_with?: InputMaybe<Scalars['String']>;
  stake_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stake_?: InputMaybe<StakeData_filter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amountDeauthorizing?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_not?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_gt?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_lt?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_gte?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_lte?: InputMaybe<Scalars['BigInt']>;
  amountDeauthorizing_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amountDeauthorizing_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  appName?: InputMaybe<Scalars['String']>;
  appName_not?: InputMaybe<Scalars['String']>;
  appName_gt?: InputMaybe<Scalars['String']>;
  appName_lt?: InputMaybe<Scalars['String']>;
  appName_gte?: InputMaybe<Scalars['String']>;
  appName_lte?: InputMaybe<Scalars['String']>;
  appName_in?: InputMaybe<Array<Scalars['String']>>;
  appName_not_in?: InputMaybe<Array<Scalars['String']>>;
  appName_contains?: InputMaybe<Scalars['String']>;
  appName_contains_nocase?: InputMaybe<Scalars['String']>;
  appName_not_contains?: InputMaybe<Scalars['String']>;
  appName_not_contains_nocase?: InputMaybe<Scalars['String']>;
  appName_starts_with?: InputMaybe<Scalars['String']>;
  appName_starts_with_nocase?: InputMaybe<Scalars['String']>;
  appName_not_starts_with?: InputMaybe<Scalars['String']>;
  appName_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  appName_ends_with?: InputMaybe<Scalars['String']>;
  appName_ends_with_nocase?: InputMaybe<Scalars['String']>;
  appName_not_ends_with?: InputMaybe<Scalars['String']>;
  appName_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<AppAuthorization_filter>>>;
  or?: InputMaybe<Array<InputMaybe<AppAuthorization_filter>>>;
};

export type AppAuthorization_orderBy =
  | 'id'
  | 'appAddress'
  | 'stake'
  | 'stake__id'
  | 'stake__beneficiary'
  | 'stake__authorizer'
  | 'stake__stakedAmount'
  | 'amount'
  | 'amountDeauthorizing'
  | 'appName';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

/** DAOMetric represents the liquid and staked T tokens in Threshold Network DAO */
export type DAOMetric = {
  /** ID is 'dao-metrics' (singleton entity) */
  id: Scalars['ID'];
  liquidTotal: Scalars['BigInt'];
  stakedTotal: Scalars['BigInt'];
};

export type DAOMetric_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidTotal?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_not?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_gt?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_lt?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_gte?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_lte?: InputMaybe<Scalars['BigInt']>;
  liquidTotal_in?: InputMaybe<Array<Scalars['BigInt']>>;
  liquidTotal_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedTotal?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_not?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_gt?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_lt?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_gte?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_lte?: InputMaybe<Scalars['BigInt']>;
  stakedTotal_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedTotal_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DAOMetric_filter>>>;
  or?: InputMaybe<Array<InputMaybe<DAOMetric_filter>>>;
};

export type DAOMetric_orderBy =
  | 'id'
  | 'liquidTotal'
  | 'stakedTotal';

export type Delegation = {
  /** The delegatee address */
  id: Scalars['ID'];
  totalWeight: Scalars['BigInt'];
};

export type Delegation_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  totalWeight?: InputMaybe<Scalars['BigInt']>;
  totalWeight_not?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalWeight_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Delegation_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Delegation_filter>>>;
};

export type Delegation_orderBy =
  | 'id'
  | 'totalWeight';

/** MinStakeAmount represents the minimum amount of tokens to stake */
export type MinStakeAmount = {
  /** ID is min-stake + transaction hash in which the amount changed */
  id: Scalars['ID'];
  amount: Scalars['BigInt'];
  updatedAt: Scalars['BigInt'];
  blockNumber: Scalars['BigInt'];
};

export type MinStakeAmount_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<MinStakeAmount_filter>>>;
  or?: InputMaybe<Array<InputMaybe<MinStakeAmount_filter>>>;
};

export type MinStakeAmount_orderBy =
  | 'id'
  | 'amount'
  | 'updatedAt'
  | 'blockNumber';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  account?: Maybe<Account>;
  accounts: Array<Account>;
  stakeData?: Maybe<StakeData>;
  stakeDatas: Array<StakeData>;
  stakeHistory?: Maybe<StakeHistory>;
  stakeHistories: Array<StakeHistory>;
  appAuthorization?: Maybe<AppAuthorization>;
  appAuthorizations: Array<AppAuthorization>;
  appAuthHistory?: Maybe<AppAuthHistory>;
  appAuthHistories: Array<AppAuthHistory>;
  minStakeAmount?: Maybe<MinStakeAmount>;
  minStakeAmounts: Array<MinStakeAmount>;
  stakeDelegation?: Maybe<StakeDelegation>;
  stakeDelegations: Array<StakeDelegation>;
  tokenholderDelegation?: Maybe<TokenholderDelegation>;
  tokenholderDelegations: Array<TokenholderDelegation>;
  daometric?: Maybe<DAOMetric>;
  daometrics: Array<DAOMetric>;
  tacoOperator?: Maybe<TACoOperator>;
  tacoOperators: Array<TACoOperator>;
  tacoCommitment?: Maybe<TACoCommitment>;
  tacoCommitments: Array<TACoCommitment>;
  delegation?: Maybe<Delegation>;
  delegations: Array<Delegation>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryaccountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaccountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeDataArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeDatasArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeData_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeData_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeHistoryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeHistoriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeHistory_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeHistory_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryappAuthorizationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryappAuthorizationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AppAuthorization_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AppAuthorization_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryappAuthHistoryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryappAuthHistoriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AppAuthHistory_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AppAuthHistory_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryminStakeAmountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryminStakeAmountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MinStakeAmount_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<MinStakeAmount_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeDelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerystakeDelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeDelegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeDelegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenholderDelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenholderDelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenholderDelegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenholderDelegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerydaometricArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerydaometricsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DAOMetric_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DAOMetric_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytacoOperatorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytacoOperatorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TACoOperator_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TACoOperator_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytacoCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytacoCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TACoCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TACoCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerydelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerydelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Delegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Delegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

/** StakeData represents the information about each stake */
export type StakeData = {
  /** ID is the staking provider's ETH address */
  id: Scalars['ID'];
  owner: Account;
  beneficiary: Scalars['Bytes'];
  authorizer: Scalars['Bytes'];
  /** Staked T token total amount */
  stakedAmount: Scalars['BigInt'];
  delegatee?: Maybe<StakeDelegation>;
  stakeHistory?: Maybe<Array<StakeHistory>>;
  authorizations?: Maybe<Array<AppAuthorization>>;
};


/** StakeData represents the information about each stake */
export type StakeDatastakeHistoryArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeHistory_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeHistory_filter>;
};


/** StakeData represents the information about each stake */
export type StakeDataauthorizationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AppAuthorization_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AppAuthorization_filter>;
};

export type StakeData_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_?: InputMaybe<Account_filter>;
  beneficiary?: InputMaybe<Scalars['Bytes']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']>>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']>;
  authorizer?: InputMaybe<Scalars['Bytes']>;
  authorizer_not?: InputMaybe<Scalars['Bytes']>;
  authorizer_gt?: InputMaybe<Scalars['Bytes']>;
  authorizer_lt?: InputMaybe<Scalars['Bytes']>;
  authorizer_gte?: InputMaybe<Scalars['Bytes']>;
  authorizer_lte?: InputMaybe<Scalars['Bytes']>;
  authorizer_in?: InputMaybe<Array<Scalars['Bytes']>>;
  authorizer_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  authorizer_contains?: InputMaybe<Scalars['Bytes']>;
  authorizer_not_contains?: InputMaybe<Scalars['Bytes']>;
  stakedAmount?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_not?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_gt?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_lt?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_gte?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_lte?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  delegatee?: InputMaybe<Scalars['String']>;
  delegatee_not?: InputMaybe<Scalars['String']>;
  delegatee_gt?: InputMaybe<Scalars['String']>;
  delegatee_lt?: InputMaybe<Scalars['String']>;
  delegatee_gte?: InputMaybe<Scalars['String']>;
  delegatee_lte?: InputMaybe<Scalars['String']>;
  delegatee_in?: InputMaybe<Array<Scalars['String']>>;
  delegatee_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegatee_contains?: InputMaybe<Scalars['String']>;
  delegatee_contains_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_contains?: InputMaybe<Scalars['String']>;
  delegatee_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegatee_starts_with?: InputMaybe<Scalars['String']>;
  delegatee_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_starts_with?: InputMaybe<Scalars['String']>;
  delegatee_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_ends_with?: InputMaybe<Scalars['String']>;
  delegatee_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_not_ends_with?: InputMaybe<Scalars['String']>;
  delegatee_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegatee_?: InputMaybe<StakeDelegation_filter>;
  stakeHistory_?: InputMaybe<StakeHistory_filter>;
  authorizations_?: InputMaybe<AppAuthorization_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakeData_filter>>>;
  or?: InputMaybe<Array<InputMaybe<StakeData_filter>>>;
};

export type StakeData_orderBy =
  | 'id'
  | 'owner'
  | 'owner__id'
  | 'beneficiary'
  | 'authorizer'
  | 'stakedAmount'
  | 'delegatee'
  | 'delegatee__id'
  | 'delegatee__totalWeight'
  | 'stakeHistory'
  | 'authorizations';

/** StakeDelegation represents the delegatee to whom the Stake DAO voting power has been delegated */
export type StakeDelegation = Delegation & {
  /** ID is delegatee ETH address */
  id: Scalars['ID'];
  /** Stakes in the T network, tracked by T staking contract */
  totalWeight: Scalars['BigInt'];
  stakeDelegators?: Maybe<Array<StakeData>>;
};


/** StakeDelegation represents the delegatee to whom the Stake DAO voting power has been delegated */
export type StakeDelegationstakeDelegatorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeData_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeData_filter>;
};

export type StakeDelegation_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  totalWeight?: InputMaybe<Scalars['BigInt']>;
  totalWeight_not?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalWeight_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakeDelegators_?: InputMaybe<StakeData_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakeDelegation_filter>>>;
  or?: InputMaybe<Array<InputMaybe<StakeDelegation_filter>>>;
};

export type StakeDelegation_orderBy =
  | 'id'
  | 'totalWeight'
  | 'stakeDelegators';

/** History of each stake */
export type StakeHistory = {
  /** ID is <staking provider address>-<block number> */
  id: Scalars['ID'];
  /** Stake data of the staking provider */
  stake: StakeData;
  /** The amount that has been added or reduced */
  eventAmount: Scalars['BigInt'];
  /** The total staked amount at this time */
  stakedAmount: Scalars['BigInt'];
  /** The event that updated the staked amount: Staked, ToppedUp or Unstaked */
  eventType: Scalars['String'];
  /** The Ethereum block number in which the stake was updated */
  blockNumber: Scalars['BigInt'];
  /** The timestamp in which the stake was updated */
  timestamp: Scalars['BigInt'];
};

export type StakeHistory_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  stake?: InputMaybe<Scalars['String']>;
  stake_not?: InputMaybe<Scalars['String']>;
  stake_gt?: InputMaybe<Scalars['String']>;
  stake_lt?: InputMaybe<Scalars['String']>;
  stake_gte?: InputMaybe<Scalars['String']>;
  stake_lte?: InputMaybe<Scalars['String']>;
  stake_in?: InputMaybe<Array<Scalars['String']>>;
  stake_not_in?: InputMaybe<Array<Scalars['String']>>;
  stake_contains?: InputMaybe<Scalars['String']>;
  stake_contains_nocase?: InputMaybe<Scalars['String']>;
  stake_not_contains?: InputMaybe<Scalars['String']>;
  stake_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stake_starts_with?: InputMaybe<Scalars['String']>;
  stake_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stake_not_starts_with?: InputMaybe<Scalars['String']>;
  stake_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stake_ends_with?: InputMaybe<Scalars['String']>;
  stake_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stake_not_ends_with?: InputMaybe<Scalars['String']>;
  stake_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stake_?: InputMaybe<StakeData_filter>;
  eventAmount?: InputMaybe<Scalars['BigInt']>;
  eventAmount_not?: InputMaybe<Scalars['BigInt']>;
  eventAmount_gt?: InputMaybe<Scalars['BigInt']>;
  eventAmount_lt?: InputMaybe<Scalars['BigInt']>;
  eventAmount_gte?: InputMaybe<Scalars['BigInt']>;
  eventAmount_lte?: InputMaybe<Scalars['BigInt']>;
  eventAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedAmount?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_not?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_gt?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_lt?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_gte?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_lte?: InputMaybe<Scalars['BigInt']>;
  stakedAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventType?: InputMaybe<Scalars['String']>;
  eventType_not?: InputMaybe<Scalars['String']>;
  eventType_gt?: InputMaybe<Scalars['String']>;
  eventType_lt?: InputMaybe<Scalars['String']>;
  eventType_gte?: InputMaybe<Scalars['String']>;
  eventType_lte?: InputMaybe<Scalars['String']>;
  eventType_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_not_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_contains?: InputMaybe<Scalars['String']>;
  eventType_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_contains?: InputMaybe<Scalars['String']>;
  eventType_not_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_starts_with?: InputMaybe<Scalars['String']>;
  eventType_starts_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_starts_with?: InputMaybe<Scalars['String']>;
  eventType_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_ends_with?: InputMaybe<Scalars['String']>;
  eventType_ends_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakeHistory_filter>>>;
  or?: InputMaybe<Array<InputMaybe<StakeHistory_filter>>>;
};

export type StakeHistory_orderBy =
  | 'id'
  | 'stake'
  | 'stake__id'
  | 'stake__beneficiary'
  | 'stake__authorizer'
  | 'stake__stakedAmount'
  | 'eventAmount'
  | 'stakedAmount'
  | 'eventType'
  | 'blockNumber'
  | 'timestamp';

export type Subscription = {
  account?: Maybe<Account>;
  accounts: Array<Account>;
  stakeData?: Maybe<StakeData>;
  stakeDatas: Array<StakeData>;
  stakeHistory?: Maybe<StakeHistory>;
  stakeHistories: Array<StakeHistory>;
  appAuthorization?: Maybe<AppAuthorization>;
  appAuthorizations: Array<AppAuthorization>;
  appAuthHistory?: Maybe<AppAuthHistory>;
  appAuthHistories: Array<AppAuthHistory>;
  minStakeAmount?: Maybe<MinStakeAmount>;
  minStakeAmounts: Array<MinStakeAmount>;
  stakeDelegation?: Maybe<StakeDelegation>;
  stakeDelegations: Array<StakeDelegation>;
  tokenholderDelegation?: Maybe<TokenholderDelegation>;
  tokenholderDelegations: Array<TokenholderDelegation>;
  daometric?: Maybe<DAOMetric>;
  daometrics: Array<DAOMetric>;
  tacoOperator?: Maybe<TACoOperator>;
  tacoOperators: Array<TACoOperator>;
  tacoCommitment?: Maybe<TACoCommitment>;
  tacoCommitments: Array<TACoCommitment>;
  delegation?: Maybe<Delegation>;
  delegations: Array<Delegation>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionaccountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionaccountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeDataArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeDatasArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeData_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeData_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeHistoryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeHistoriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeHistory_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeHistory_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionappAuthorizationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionappAuthorizationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AppAuthorization_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AppAuthorization_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionappAuthHistoryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionappAuthHistoriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AppAuthHistory_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AppAuthHistory_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionminStakeAmountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionminStakeAmountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MinStakeAmount_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<MinStakeAmount_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeDelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionstakeDelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakeDelegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<StakeDelegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontokenholderDelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontokenholderDelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenholderDelegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenholderDelegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiondaometricArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiondaometricsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DAOMetric_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DAOMetric_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontacoOperatorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontacoOperatorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TACoOperator_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TACoOperator_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontacoCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontacoCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TACoCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TACoCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiondelegationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiondelegationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Delegation_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Delegation_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

/** TACo commitments made by a staking provider */
export type TACoCommitment = {
  /** ID is the staking provider address */
  id: Scalars['ID'];
  /** Timestamp of the end of the lock-up */
  endCommitment: Scalars['BigInt'];
  /** Selected duration in month of the lock-up */
  duration: Scalars['Int'];
};

export type TACoCommitment_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  endCommitment?: InputMaybe<Scalars['BigInt']>;
  endCommitment_not?: InputMaybe<Scalars['BigInt']>;
  endCommitment_gt?: InputMaybe<Scalars['BigInt']>;
  endCommitment_lt?: InputMaybe<Scalars['BigInt']>;
  endCommitment_gte?: InputMaybe<Scalars['BigInt']>;
  endCommitment_lte?: InputMaybe<Scalars['BigInt']>;
  endCommitment_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endCommitment_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  duration?: InputMaybe<Scalars['Int']>;
  duration_not?: InputMaybe<Scalars['Int']>;
  duration_gt?: InputMaybe<Scalars['Int']>;
  duration_lt?: InputMaybe<Scalars['Int']>;
  duration_gte?: InputMaybe<Scalars['Int']>;
  duration_lte?: InputMaybe<Scalars['Int']>;
  duration_in?: InputMaybe<Array<Scalars['Int']>>;
  duration_not_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TACoCommitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TACoCommitment_filter>>>;
};

export type TACoCommitment_orderBy =
  | 'id'
  | 'endCommitment'
  | 'duration';

/** TACoOperator represents the TACo operator's info of a staking provider */
export type TACoOperator = {
  /** ID is the staking provider address */
  id: Scalars['ID'];
  /** Operator's address */
  operator: Scalars['Bytes'];
  /** Timestamp in which the current operator was bonded to the staking provider */
  bondedTimestamp: Scalars['BigInt'];
  /** Timestamp in which the first operator of this staking provider was bonded */
  bondedTimestampFirstOperator?: Maybe<Scalars['BigInt']>;
};

export type TACoOperator_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  operator?: InputMaybe<Scalars['Bytes']>;
  operator_not?: InputMaybe<Scalars['Bytes']>;
  operator_gt?: InputMaybe<Scalars['Bytes']>;
  operator_lt?: InputMaybe<Scalars['Bytes']>;
  operator_gte?: InputMaybe<Scalars['Bytes']>;
  operator_lte?: InputMaybe<Scalars['Bytes']>;
  operator_in?: InputMaybe<Array<Scalars['Bytes']>>;
  operator_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  operator_contains?: InputMaybe<Scalars['Bytes']>;
  operator_not_contains?: InputMaybe<Scalars['Bytes']>;
  bondedTimestamp?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bondedTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bondedTimestampFirstOperator?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_not?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_gt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_lt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_gte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_lte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestampFirstOperator_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bondedTimestampFirstOperator_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TACoOperator_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TACoOperator_filter>>>;
};

export type TACoOperator_orderBy =
  | 'id'
  | 'operator'
  | 'bondedTimestamp'
  | 'bondedTimestampFirstOperator';

/** TokenholderDelegation represents the delegatee to whom the TokenHolder DAO voting power has been delegated */
export type TokenholderDelegation = Delegation & {
  /** ID is delegatee ETH address */
  id: Scalars['ID'];
  /** Liquid T plus staked T in the T network. Legacy stakes (NU/KEEP) count for tokenholders' voting power, but not for the total voting power of the Tokenholder DAO (as it's already accounted by the Vending Machines) */
  totalWeight: Scalars['BigInt'];
  /** Liquid T, tracked by the T Token contract */
  liquidWeight: Scalars['BigInt'];
  delegators?: Maybe<Array<Account>>;
};


/** TokenholderDelegation represents the delegatee to whom the TokenHolder DAO voting power has been delegated */
export type TokenholderDelegationdelegatorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
};

export type TokenholderDelegation_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  totalWeight?: InputMaybe<Scalars['BigInt']>;
  totalWeight_not?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lt?: InputMaybe<Scalars['BigInt']>;
  totalWeight_gte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_lte?: InputMaybe<Scalars['BigInt']>;
  totalWeight_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalWeight_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  liquidWeight?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_not?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_gt?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_lt?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_gte?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_lte?: InputMaybe<Scalars['BigInt']>;
  liquidWeight_in?: InputMaybe<Array<Scalars['BigInt']>>;
  liquidWeight_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  delegators_?: InputMaybe<Account_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenholderDelegation_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TokenholderDelegation_filter>>>;
};

export type TokenholderDelegation_orderBy =
  | 'id'
  | 'totalWeight'
  | 'liquidWeight'
  | 'delegators';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  account: InContextSdkMethod<Query['account'], QueryaccountArgs, MeshContext>,
  /** null **/
  accounts: InContextSdkMethod<Query['accounts'], QueryaccountsArgs, MeshContext>,
  /** null **/
  stakeData: InContextSdkMethod<Query['stakeData'], QuerystakeDataArgs, MeshContext>,
  /** null **/
  stakeDatas: InContextSdkMethod<Query['stakeDatas'], QuerystakeDatasArgs, MeshContext>,
  /** null **/
  stakeHistory: InContextSdkMethod<Query['stakeHistory'], QuerystakeHistoryArgs, MeshContext>,
  /** null **/
  stakeHistories: InContextSdkMethod<Query['stakeHistories'], QuerystakeHistoriesArgs, MeshContext>,
  /** null **/
  appAuthorization: InContextSdkMethod<Query['appAuthorization'], QueryappAuthorizationArgs, MeshContext>,
  /** null **/
  appAuthorizations: InContextSdkMethod<Query['appAuthorizations'], QueryappAuthorizationsArgs, MeshContext>,
  /** null **/
  appAuthHistory: InContextSdkMethod<Query['appAuthHistory'], QueryappAuthHistoryArgs, MeshContext>,
  /** null **/
  appAuthHistories: InContextSdkMethod<Query['appAuthHistories'], QueryappAuthHistoriesArgs, MeshContext>,
  /** null **/
  minStakeAmount: InContextSdkMethod<Query['minStakeAmount'], QueryminStakeAmountArgs, MeshContext>,
  /** null **/
  minStakeAmounts: InContextSdkMethod<Query['minStakeAmounts'], QueryminStakeAmountsArgs, MeshContext>,
  /** null **/
  stakeDelegation: InContextSdkMethod<Query['stakeDelegation'], QuerystakeDelegationArgs, MeshContext>,
  /** null **/
  stakeDelegations: InContextSdkMethod<Query['stakeDelegations'], QuerystakeDelegationsArgs, MeshContext>,
  /** null **/
  tokenholderDelegation: InContextSdkMethod<Query['tokenholderDelegation'], QuerytokenholderDelegationArgs, MeshContext>,
  /** null **/
  tokenholderDelegations: InContextSdkMethod<Query['tokenholderDelegations'], QuerytokenholderDelegationsArgs, MeshContext>,
  /** null **/
  daometric: InContextSdkMethod<Query['daometric'], QuerydaometricArgs, MeshContext>,
  /** null **/
  daometrics: InContextSdkMethod<Query['daometrics'], QuerydaometricsArgs, MeshContext>,
  /** null **/
  tacoOperator: InContextSdkMethod<Query['tacoOperator'], QuerytacoOperatorArgs, MeshContext>,
  /** null **/
  tacoOperators: InContextSdkMethod<Query['tacoOperators'], QuerytacoOperatorsArgs, MeshContext>,
  /** null **/
  tacoCommitment: InContextSdkMethod<Query['tacoCommitment'], QuerytacoCommitmentArgs, MeshContext>,
  /** null **/
  tacoCommitments: InContextSdkMethod<Query['tacoCommitments'], QuerytacoCommitmentsArgs, MeshContext>,
  /** null **/
  delegation: InContextSdkMethod<Query['delegation'], QuerydelegationArgs, MeshContext>,
  /** null **/
  delegations: InContextSdkMethod<Query['delegations'], QuerydelegationsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  account: InContextSdkMethod<Subscription['account'], SubscriptionaccountArgs, MeshContext>,
  /** null **/
  accounts: InContextSdkMethod<Subscription['accounts'], SubscriptionaccountsArgs, MeshContext>,
  /** null **/
  stakeData: InContextSdkMethod<Subscription['stakeData'], SubscriptionstakeDataArgs, MeshContext>,
  /** null **/
  stakeDatas: InContextSdkMethod<Subscription['stakeDatas'], SubscriptionstakeDatasArgs, MeshContext>,
  /** null **/
  stakeHistory: InContextSdkMethod<Subscription['stakeHistory'], SubscriptionstakeHistoryArgs, MeshContext>,
  /** null **/
  stakeHistories: InContextSdkMethod<Subscription['stakeHistories'], SubscriptionstakeHistoriesArgs, MeshContext>,
  /** null **/
  appAuthorization: InContextSdkMethod<Subscription['appAuthorization'], SubscriptionappAuthorizationArgs, MeshContext>,
  /** null **/
  appAuthorizations: InContextSdkMethod<Subscription['appAuthorizations'], SubscriptionappAuthorizationsArgs, MeshContext>,
  /** null **/
  appAuthHistory: InContextSdkMethod<Subscription['appAuthHistory'], SubscriptionappAuthHistoryArgs, MeshContext>,
  /** null **/
  appAuthHistories: InContextSdkMethod<Subscription['appAuthHistories'], SubscriptionappAuthHistoriesArgs, MeshContext>,
  /** null **/
  minStakeAmount: InContextSdkMethod<Subscription['minStakeAmount'], SubscriptionminStakeAmountArgs, MeshContext>,
  /** null **/
  minStakeAmounts: InContextSdkMethod<Subscription['minStakeAmounts'], SubscriptionminStakeAmountsArgs, MeshContext>,
  /** null **/
  stakeDelegation: InContextSdkMethod<Subscription['stakeDelegation'], SubscriptionstakeDelegationArgs, MeshContext>,
  /** null **/
  stakeDelegations: InContextSdkMethod<Subscription['stakeDelegations'], SubscriptionstakeDelegationsArgs, MeshContext>,
  /** null **/
  tokenholderDelegation: InContextSdkMethod<Subscription['tokenholderDelegation'], SubscriptiontokenholderDelegationArgs, MeshContext>,
  /** null **/
  tokenholderDelegations: InContextSdkMethod<Subscription['tokenholderDelegations'], SubscriptiontokenholderDelegationsArgs, MeshContext>,
  /** null **/
  daometric: InContextSdkMethod<Subscription['daometric'], SubscriptiondaometricArgs, MeshContext>,
  /** null **/
  daometrics: InContextSdkMethod<Subscription['daometrics'], SubscriptiondaometricsArgs, MeshContext>,
  /** null **/
  tacoOperator: InContextSdkMethod<Subscription['tacoOperator'], SubscriptiontacoOperatorArgs, MeshContext>,
  /** null **/
  tacoOperators: InContextSdkMethod<Subscription['tacoOperators'], SubscriptiontacoOperatorsArgs, MeshContext>,
  /** null **/
  tacoCommitment: InContextSdkMethod<Subscription['tacoCommitment'], SubscriptiontacoCommitmentArgs, MeshContext>,
  /** null **/
  tacoCommitments: InContextSdkMethod<Subscription['tacoCommitments'], SubscriptiontacoCommitmentsArgs, MeshContext>,
  /** null **/
  delegation: InContextSdkMethod<Subscription['delegation'], SubscriptiondelegationArgs, MeshContext>,
  /** null **/
  delegations: InContextSdkMethod<Subscription['delegations'], SubscriptiondelegationsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["development-threshold-subgraph"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
