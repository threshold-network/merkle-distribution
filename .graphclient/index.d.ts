import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { MeshHTTPHandler } from '@graphql-mesh/http';
import { ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import type { ThresholdStakingPolygonTypes } from './sources/threshold-staking-polygon/types';
import type { DevelopmentThresholdSubgraphTypes } from './sources/development-threshold-subgraph/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};
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
export type Query = {
    tacoOperator?: Maybe<TACoOperator>;
    tacoOperators: Array<TACoOperator>;
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    account?: Maybe<Account>;
    accounts: Array<Account>;
    stakeData?: Maybe<StakeData>;
    stakeDatas: Array<StakeData>;
    epochStake?: Maybe<EpochStake>;
    epochStakes: Array<EpochStake>;
    epoch?: Maybe<Epoch>;
    epoches: Array<Epoch>;
    epochCounter?: Maybe<EpochCounter>;
    epochCounters: Array<EpochCounter>;
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
    tacoCommitment?: Maybe<TACoCommitment>;
    tacoCommitments: Array<TACoCommitment>;
    delegation?: Maybe<Delegation>;
    delegations: Array<Delegation>;
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
export type Query_metaArgs = {
    block?: InputMaybe<Block_height>;
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
export type QueryepochStakeArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QueryepochStakesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EpochStake_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<EpochStake_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QueryepochArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QueryepochesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Epoch_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Epoch_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QueryepochCounterArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QueryepochCountersArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EpochCounter_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<EpochCounter_filter>;
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
export type Subscription = {
    tacoOperator?: Maybe<TACoOperator>;
    tacoOperators: Array<TACoOperator>;
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    account?: Maybe<Account>;
    accounts: Array<Account>;
    stakeData?: Maybe<StakeData>;
    stakeDatas: Array<StakeData>;
    epochStake?: Maybe<EpochStake>;
    epochStakes: Array<EpochStake>;
    epoch?: Maybe<Epoch>;
    epoches: Array<Epoch>;
    epochCounter?: Maybe<EpochCounter>;
    epochCounters: Array<EpochCounter>;
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
    tacoCommitment?: Maybe<TACoCommitment>;
    tacoCommitments: Array<TACoCommitment>;
    delegation?: Maybe<Delegation>;
    delegations: Array<Delegation>;
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
export type Subscription_metaArgs = {
    block?: InputMaybe<Block_height>;
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
export type SubscriptionepochStakeArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionepochStakesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EpochStake_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<EpochStake_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionepochArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionepochesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Epoch_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Epoch_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionepochCounterArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionepochCountersArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EpochCounter_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<EpochCounter_filter>;
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
export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};
export type Block_height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};
/** Defines the order direction, either ascending or descending */
export type OrderDirection = 'asc' | 'desc';
/** TACoOperator represents the TACo operator's info of a staking provider */
export type TACoOperator = {
    /** ID is the staking provider address */
    id: Scalars['ID'];
    /** Operator's address */
    operator: Scalars['Bytes'];
    /** Timestamp in which the current operator was confirmed to the staking provider */
    confirmedTimestamp: Scalars['BigInt'];
    /** Timestamp in which the first operator of this staking provider was confirmed */
    confirmedTimestampFirstOperator?: Maybe<Scalars['BigInt']>;
    /** The operator won't be confirmed during the operator address update */
    confirmed?: Maybe<Scalars['Boolean']>;
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
    confirmedTimestamp?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    confirmedTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    confirmedTimestampFirstOperator?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_not?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_gt?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_lt?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_gte?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_lte?: InputMaybe<Scalars['BigInt']>;
    confirmedTimestampFirstOperator_in?: InputMaybe<Array<Scalars['BigInt']>>;
    confirmedTimestampFirstOperator_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    confirmed?: InputMaybe<Scalars['Boolean']>;
    confirmed_not?: InputMaybe<Scalars['Boolean']>;
    confirmed_in?: InputMaybe<Array<Scalars['Boolean']>>;
    confirmed_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<TACoOperator_filter>>>;
    or?: InputMaybe<Array<InputMaybe<TACoOperator_filter>>>;
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
};
export type TACoOperator_orderBy = 'id' | 'operator' | 'confirmedTimestamp' | 'confirmedTimestampFirstOperator' | 'confirmed' | 'bondedTimestamp' | 'bondedTimestampFirstOperator';
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
'allow'
/** If the subgraph has indexing errors, data will be omitted. The default. */
 | 'deny';
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
export type Account_orderBy = 'id' | 'stakes' | 'delegatee' | 'delegatee__id' | 'delegatee__totalWeight' | 'delegatee__liquidWeight';
/** AppAuthHistory stores each change in the stake's authorization of apps */
export type AppAuthHistory = {
    /** IS is <staking provider address>-<application address>-<block number> */
    id: Scalars['ID'];
    /** AppAuthorization of this update in the authorization */
    appAuthorization: AppAuthorization;
    /** Amount of total T authorized by staking provider to the application in this block */
    amount: Scalars['BigInt'];
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
export type AppAuthHistory_orderBy = 'id' | 'appAuthorization' | 'appAuthorization__id' | 'appAuthorization__appAddress' | 'appAuthorization__amount' | 'appAuthorization__amountDeauthorizingTo' | 'appAuthorization__appName' | 'amount' | 'eventType' | 'blockNumber' | 'timestamp';
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
    /** Amount of T that will remain after the deauthorization process */
    amountDeauthorizingTo: Scalars['BigInt'];
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
    amountDeauthorizingTo?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_not?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_gt?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_lt?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_gte?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_lte?: InputMaybe<Scalars['BigInt']>;
    amountDeauthorizingTo_in?: InputMaybe<Array<Scalars['BigInt']>>;
    amountDeauthorizingTo_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
export type AppAuthorization_orderBy = 'id' | 'appAddress' | 'stake' | 'stake__id' | 'stake__beneficiary' | 'stake__authorizer' | 'stake__tStake' | 'stake__keepInTStake' | 'stake__nuInTStake' | 'stake__totalStaked' | 'amount' | 'amountDeauthorizingTo' | 'appName';
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
export type DAOMetric_orderBy = 'id' | 'liquidTotal' | 'stakedTotal';
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
export type Delegation_orderBy = 'id' | 'totalWeight';
/** Epoch represents the staking status of the network at each time instant */
export type Epoch = {
    /** ID is a counter number starting at 0 */
    id: Scalars['ID'];
    /** UNIX timestamp in which this epoch begins */
    timestamp: Scalars['BigInt'];
    /** Duration of this epoch in seconds */
    duration?: Maybe<Scalars['BigInt']>;
    /** T total amount resulted of all stakes in this epoch */
    totalAmount: Scalars['BigInt'];
    /** List of active stakes during this epoch */
    stakes?: Maybe<Array<EpochStake>>;
};
/** Epoch represents the staking status of the network at each time instant */
export type EpochstakesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EpochStake_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<EpochStake_filter>;
};
/** EpochCounter represents the amount of epochs up to this moment */
export type EpochCounter = {
    /** ID is 'epoch-counter' (singleton entity) */
    id: Scalars['ID'];
    count: Scalars['Int'];
};
export type EpochCounter_filter = {
    id?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    count?: InputMaybe<Scalars['Int']>;
    count_not?: InputMaybe<Scalars['Int']>;
    count_gt?: InputMaybe<Scalars['Int']>;
    count_lt?: InputMaybe<Scalars['Int']>;
    count_gte?: InputMaybe<Scalars['Int']>;
    count_lte?: InputMaybe<Scalars['Int']>;
    count_in?: InputMaybe<Array<Scalars['Int']>>;
    count_not_in?: InputMaybe<Array<Scalars['Int']>>;
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<EpochCounter_filter>>>;
    or?: InputMaybe<Array<InputMaybe<EpochCounter_filter>>>;
};
export type EpochCounter_orderBy = 'id' | 'count';
/** EpochStake represents a single stake in a single epoch */
export type EpochStake = {
    /** ID is the staking provider's ETH address + epoch counter */
    id: Scalars['ID'];
    epoch: Epoch;
    stakingProvider: Scalars['Bytes'];
    owner: Scalars['Bytes'];
    amount: Scalars['BigInt'];
};
export type EpochStake_filter = {
    id?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    epoch?: InputMaybe<Scalars['String']>;
    epoch_not?: InputMaybe<Scalars['String']>;
    epoch_gt?: InputMaybe<Scalars['String']>;
    epoch_lt?: InputMaybe<Scalars['String']>;
    epoch_gte?: InputMaybe<Scalars['String']>;
    epoch_lte?: InputMaybe<Scalars['String']>;
    epoch_in?: InputMaybe<Array<Scalars['String']>>;
    epoch_not_in?: InputMaybe<Array<Scalars['String']>>;
    epoch_contains?: InputMaybe<Scalars['String']>;
    epoch_contains_nocase?: InputMaybe<Scalars['String']>;
    epoch_not_contains?: InputMaybe<Scalars['String']>;
    epoch_not_contains_nocase?: InputMaybe<Scalars['String']>;
    epoch_starts_with?: InputMaybe<Scalars['String']>;
    epoch_starts_with_nocase?: InputMaybe<Scalars['String']>;
    epoch_not_starts_with?: InputMaybe<Scalars['String']>;
    epoch_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    epoch_ends_with?: InputMaybe<Scalars['String']>;
    epoch_ends_with_nocase?: InputMaybe<Scalars['String']>;
    epoch_not_ends_with?: InputMaybe<Scalars['String']>;
    epoch_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    epoch_?: InputMaybe<Epoch_filter>;
    stakingProvider?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_not?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_gt?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_lt?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_gte?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_lte?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_in?: InputMaybe<Array<Scalars['Bytes']>>;
    stakingProvider_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    stakingProvider_contains?: InputMaybe<Scalars['Bytes']>;
    stakingProvider_not_contains?: InputMaybe<Scalars['Bytes']>;
    owner?: InputMaybe<Scalars['Bytes']>;
    owner_not?: InputMaybe<Scalars['Bytes']>;
    owner_gt?: InputMaybe<Scalars['Bytes']>;
    owner_lt?: InputMaybe<Scalars['Bytes']>;
    owner_gte?: InputMaybe<Scalars['Bytes']>;
    owner_lte?: InputMaybe<Scalars['Bytes']>;
    owner_in?: InputMaybe<Array<Scalars['Bytes']>>;
    owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    owner_contains?: InputMaybe<Scalars['Bytes']>;
    owner_not_contains?: InputMaybe<Scalars['Bytes']>;
    amount?: InputMaybe<Scalars['BigInt']>;
    amount_not?: InputMaybe<Scalars['BigInt']>;
    amount_gt?: InputMaybe<Scalars['BigInt']>;
    amount_lt?: InputMaybe<Scalars['BigInt']>;
    amount_gte?: InputMaybe<Scalars['BigInt']>;
    amount_lte?: InputMaybe<Scalars['BigInt']>;
    amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<EpochStake_filter>>>;
    or?: InputMaybe<Array<InputMaybe<EpochStake_filter>>>;
};
export type EpochStake_orderBy = 'id' | 'epoch' | 'epoch__id' | 'epoch__timestamp' | 'epoch__duration' | 'epoch__totalAmount' | 'stakingProvider' | 'owner' | 'amount';
export type Epoch_filter = {
    id?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    timestamp?: InputMaybe<Scalars['BigInt']>;
    timestamp_not?: InputMaybe<Scalars['BigInt']>;
    timestamp_gt?: InputMaybe<Scalars['BigInt']>;
    timestamp_lt?: InputMaybe<Scalars['BigInt']>;
    timestamp_gte?: InputMaybe<Scalars['BigInt']>;
    timestamp_lte?: InputMaybe<Scalars['BigInt']>;
    timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    duration?: InputMaybe<Scalars['BigInt']>;
    duration_not?: InputMaybe<Scalars['BigInt']>;
    duration_gt?: InputMaybe<Scalars['BigInt']>;
    duration_lt?: InputMaybe<Scalars['BigInt']>;
    duration_gte?: InputMaybe<Scalars['BigInt']>;
    duration_lte?: InputMaybe<Scalars['BigInt']>;
    duration_in?: InputMaybe<Array<Scalars['BigInt']>>;
    duration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalAmount?: InputMaybe<Scalars['BigInt']>;
    totalAmount_not?: InputMaybe<Scalars['BigInt']>;
    totalAmount_gt?: InputMaybe<Scalars['BigInt']>;
    totalAmount_lt?: InputMaybe<Scalars['BigInt']>;
    totalAmount_gte?: InputMaybe<Scalars['BigInt']>;
    totalAmount_lte?: InputMaybe<Scalars['BigInt']>;
    totalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    stakes?: InputMaybe<Array<Scalars['String']>>;
    stakes_not?: InputMaybe<Array<Scalars['String']>>;
    stakes_contains?: InputMaybe<Array<Scalars['String']>>;
    stakes_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
    stakes_not_contains?: InputMaybe<Array<Scalars['String']>>;
    stakes_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
    stakes_?: InputMaybe<EpochStake_filter>;
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Epoch_filter>>>;
    or?: InputMaybe<Array<InputMaybe<Epoch_filter>>>;
};
export type Epoch_orderBy = 'id' | 'timestamp' | 'duration' | 'totalAmount' | 'stakes';
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
export type MinStakeAmount_orderBy = 'id' | 'amount' | 'updatedAt' | 'blockNumber';
/** StakeData represents the information about each stake */
export type StakeData = {
    /** ID is the staking provider's ETH address */
    id: Scalars['ID'];
    owner: Account;
    beneficiary: Scalars['Bytes'];
    authorizer: Scalars['Bytes'];
    /** Staked native T token amount */
    tStake: Scalars['BigInt'];
    /** Staked legacy KEEP token amount converted to T */
    keepInTStake: Scalars['BigInt'];
    /** Staked legacy Nu token amount converted to T */
    nuInTStake: Scalars['BigInt'];
    /** Staked T token total amount (T + KEEP in T + Nu in T) */
    totalStaked: Scalars['BigInt'];
    delegatee?: Maybe<StakeDelegation>;
    authorizations?: Maybe<Array<AppAuthorization>>;
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
    tStake?: InputMaybe<Scalars['BigInt']>;
    tStake_not?: InputMaybe<Scalars['BigInt']>;
    tStake_gt?: InputMaybe<Scalars['BigInt']>;
    tStake_lt?: InputMaybe<Scalars['BigInt']>;
    tStake_gte?: InputMaybe<Scalars['BigInt']>;
    tStake_lte?: InputMaybe<Scalars['BigInt']>;
    tStake_in?: InputMaybe<Array<Scalars['BigInt']>>;
    tStake_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    keepInTStake?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_not?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_gt?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_lt?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_gte?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_lte?: InputMaybe<Scalars['BigInt']>;
    keepInTStake_in?: InputMaybe<Array<Scalars['BigInt']>>;
    keepInTStake_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    nuInTStake?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_not?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_gt?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_lt?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_gte?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_lte?: InputMaybe<Scalars['BigInt']>;
    nuInTStake_in?: InputMaybe<Array<Scalars['BigInt']>>;
    nuInTStake_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalStaked?: InputMaybe<Scalars['BigInt']>;
    totalStaked_not?: InputMaybe<Scalars['BigInt']>;
    totalStaked_gt?: InputMaybe<Scalars['BigInt']>;
    totalStaked_lt?: InputMaybe<Scalars['BigInt']>;
    totalStaked_gte?: InputMaybe<Scalars['BigInt']>;
    totalStaked_lte?: InputMaybe<Scalars['BigInt']>;
    totalStaked_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalStaked_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
    authorizations_?: InputMaybe<AppAuthorization_filter>;
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<StakeData_filter>>>;
    or?: InputMaybe<Array<InputMaybe<StakeData_filter>>>;
};
export type StakeData_orderBy = 'id' | 'owner' | 'owner__id' | 'beneficiary' | 'authorizer' | 'tStake' | 'keepInTStake' | 'nuInTStake' | 'totalStaked' | 'delegatee' | 'delegatee__id' | 'delegatee__totalWeight' | 'authorizations';
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
export type StakeDelegation_orderBy = 'id' | 'totalWeight' | 'stakeDelegators';
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
export type TACoCommitment_orderBy = 'id' | 'endCommitment' | 'duration';
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
export type TokenholderDelegation_orderBy = 'id' | 'totalWeight' | 'liquidWeight' | 'delegators';
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;
export type ResolverTypeWrapper<T> = Promise<T> | T;
export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
    fragment: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
    selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs> | StitchingResolver<TResult, TParent, TContext, TArgs>;
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;
export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{
        [key in TKey]: TResult;
    }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, {
        [key in TKey]: TResult;
    }, TContext, TArgs>;
}
export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}
export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;
export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export type NextResolverFn<T> = () => Promise<T>;
export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
    Query: ResolverTypeWrapper<{}>;
    Subscription: ResolverTypeWrapper<{}>;
    BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
    BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
    BlockChangedFilter: BlockChangedFilter;
    Block_height: Block_height;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
    Float: ResolverTypeWrapper<Scalars['Float']>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    Int8: ResolverTypeWrapper<Scalars['Int8']>;
    OrderDirection: OrderDirection;
    String: ResolverTypeWrapper<Scalars['String']>;
    TACoOperator: ResolverTypeWrapper<TACoOperator>;
    TACoOperator_filter: TACoOperator_filter;
    TACoOperator_orderBy: TACoOperator_orderBy;
    _Block_: ResolverTypeWrapper<_Block_>;
    _Meta_: ResolverTypeWrapper<_Meta_>;
    _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
    Account: ResolverTypeWrapper<Account>;
    Account_filter: Account_filter;
    Account_orderBy: Account_orderBy;
    AppAuthHistory: ResolverTypeWrapper<AppAuthHistory>;
    AppAuthHistory_filter: AppAuthHistory_filter;
    AppAuthHistory_orderBy: AppAuthHistory_orderBy;
    AppAuthorization: ResolverTypeWrapper<AppAuthorization>;
    AppAuthorization_filter: AppAuthorization_filter;
    AppAuthorization_orderBy: AppAuthorization_orderBy;
    DAOMetric: ResolverTypeWrapper<DAOMetric>;
    DAOMetric_filter: DAOMetric_filter;
    DAOMetric_orderBy: DAOMetric_orderBy;
    Delegation: ResolversTypes['StakeDelegation'] | ResolversTypes['TokenholderDelegation'];
    Delegation_filter: Delegation_filter;
    Delegation_orderBy: Delegation_orderBy;
    Epoch: ResolverTypeWrapper<Epoch>;
    EpochCounter: ResolverTypeWrapper<EpochCounter>;
    EpochCounter_filter: EpochCounter_filter;
    EpochCounter_orderBy: EpochCounter_orderBy;
    EpochStake: ResolverTypeWrapper<EpochStake>;
    EpochStake_filter: EpochStake_filter;
    EpochStake_orderBy: EpochStake_orderBy;
    Epoch_filter: Epoch_filter;
    Epoch_orderBy: Epoch_orderBy;
    MinStakeAmount: ResolverTypeWrapper<MinStakeAmount>;
    MinStakeAmount_filter: MinStakeAmount_filter;
    MinStakeAmount_orderBy: MinStakeAmount_orderBy;
    StakeData: ResolverTypeWrapper<StakeData>;
    StakeData_filter: StakeData_filter;
    StakeData_orderBy: StakeData_orderBy;
    StakeDelegation: ResolverTypeWrapper<StakeDelegation>;
    StakeDelegation_filter: StakeDelegation_filter;
    StakeDelegation_orderBy: StakeDelegation_orderBy;
    TACoCommitment: ResolverTypeWrapper<TACoCommitment>;
    TACoCommitment_filter: TACoCommitment_filter;
    TACoCommitment_orderBy: TACoCommitment_orderBy;
    TokenholderDelegation: ResolverTypeWrapper<TokenholderDelegation>;
    TokenholderDelegation_filter: TokenholderDelegation_filter;
    TokenholderDelegation_orderBy: TokenholderDelegation_orderBy;
}>;
/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    Query: {};
    Subscription: {};
    BigDecimal: Scalars['BigDecimal'];
    BigInt: Scalars['BigInt'];
    BlockChangedFilter: BlockChangedFilter;
    Block_height: Block_height;
    Boolean: Scalars['Boolean'];
    Bytes: Scalars['Bytes'];
    Float: Scalars['Float'];
    ID: Scalars['ID'];
    Int: Scalars['Int'];
    Int8: Scalars['Int8'];
    String: Scalars['String'];
    TACoOperator: TACoOperator;
    TACoOperator_filter: TACoOperator_filter;
    _Block_: _Block_;
    _Meta_: _Meta_;
    Account: Account;
    Account_filter: Account_filter;
    AppAuthHistory: AppAuthHistory;
    AppAuthHistory_filter: AppAuthHistory_filter;
    AppAuthorization: AppAuthorization;
    AppAuthorization_filter: AppAuthorization_filter;
    DAOMetric: DAOMetric;
    DAOMetric_filter: DAOMetric_filter;
    Delegation: ResolversParentTypes['StakeDelegation'] | ResolversParentTypes['TokenholderDelegation'];
    Delegation_filter: Delegation_filter;
    Epoch: Epoch;
    EpochCounter: EpochCounter;
    EpochCounter_filter: EpochCounter_filter;
    EpochStake: EpochStake;
    EpochStake_filter: EpochStake_filter;
    Epoch_filter: Epoch_filter;
    MinStakeAmount: MinStakeAmount;
    MinStakeAmount_filter: MinStakeAmount_filter;
    StakeData: StakeData;
    StakeData_filter: StakeData_filter;
    StakeDelegation: StakeDelegation;
    StakeDelegation_filter: StakeDelegation_filter;
    TACoCommitment: TACoCommitment;
    TACoCommitment_filter: TACoCommitment_filter;
    TokenholderDelegation: TokenholderDelegation;
    TokenholderDelegation_filter: TokenholderDelegation_filter;
}>;
export type entityDirectiveArgs = {};
export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type subgraphIdDirectiveArgs = {
    id: Scalars['String'];
};
export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type derivedFromDirectiveArgs = {
    field: Scalars['String'];
};
export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
    tacoOperator?: Resolver<Maybe<ResolversTypes['TACoOperator']>, ParentType, ContextType, RequireFields<QuerytacoOperatorArgs, 'id' | 'subgraphError'>>;
    tacoOperators?: Resolver<Array<ResolversTypes['TACoOperator']>, ParentType, ContextType, RequireFields<QuerytacoOperatorsArgs, 'skip' | 'first' | 'subgraphError'>>;
    _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
    account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountArgs, 'id' | 'subgraphError'>>;
    accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountsArgs, 'skip' | 'first' | 'subgraphError'>>;
    stakeData?: Resolver<Maybe<ResolversTypes['StakeData']>, ParentType, ContextType, RequireFields<QuerystakeDataArgs, 'id' | 'subgraphError'>>;
    stakeDatas?: Resolver<Array<ResolversTypes['StakeData']>, ParentType, ContextType, RequireFields<QuerystakeDatasArgs, 'skip' | 'first' | 'subgraphError'>>;
    epochStake?: Resolver<Maybe<ResolversTypes['EpochStake']>, ParentType, ContextType, RequireFields<QueryepochStakeArgs, 'id' | 'subgraphError'>>;
    epochStakes?: Resolver<Array<ResolversTypes['EpochStake']>, ParentType, ContextType, RequireFields<QueryepochStakesArgs, 'skip' | 'first' | 'subgraphError'>>;
    epoch?: Resolver<Maybe<ResolversTypes['Epoch']>, ParentType, ContextType, RequireFields<QueryepochArgs, 'id' | 'subgraphError'>>;
    epoches?: Resolver<Array<ResolversTypes['Epoch']>, ParentType, ContextType, RequireFields<QueryepochesArgs, 'skip' | 'first' | 'subgraphError'>>;
    epochCounter?: Resolver<Maybe<ResolversTypes['EpochCounter']>, ParentType, ContextType, RequireFields<QueryepochCounterArgs, 'id' | 'subgraphError'>>;
    epochCounters?: Resolver<Array<ResolversTypes['EpochCounter']>, ParentType, ContextType, RequireFields<QueryepochCountersArgs, 'skip' | 'first' | 'subgraphError'>>;
    appAuthorization?: Resolver<Maybe<ResolversTypes['AppAuthorization']>, ParentType, ContextType, RequireFields<QueryappAuthorizationArgs, 'id' | 'subgraphError'>>;
    appAuthorizations?: Resolver<Array<ResolversTypes['AppAuthorization']>, ParentType, ContextType, RequireFields<QueryappAuthorizationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    appAuthHistory?: Resolver<Maybe<ResolversTypes['AppAuthHistory']>, ParentType, ContextType, RequireFields<QueryappAuthHistoryArgs, 'id' | 'subgraphError'>>;
    appAuthHistories?: Resolver<Array<ResolversTypes['AppAuthHistory']>, ParentType, ContextType, RequireFields<QueryappAuthHistoriesArgs, 'skip' | 'first' | 'subgraphError'>>;
    minStakeAmount?: Resolver<Maybe<ResolversTypes['MinStakeAmount']>, ParentType, ContextType, RequireFields<QueryminStakeAmountArgs, 'id' | 'subgraphError'>>;
    minStakeAmounts?: Resolver<Array<ResolversTypes['MinStakeAmount']>, ParentType, ContextType, RequireFields<QueryminStakeAmountsArgs, 'skip' | 'first' | 'subgraphError'>>;
    stakeDelegation?: Resolver<Maybe<ResolversTypes['StakeDelegation']>, ParentType, ContextType, RequireFields<QuerystakeDelegationArgs, 'id' | 'subgraphError'>>;
    stakeDelegations?: Resolver<Array<ResolversTypes['StakeDelegation']>, ParentType, ContextType, RequireFields<QuerystakeDelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    tokenholderDelegation?: Resolver<Maybe<ResolversTypes['TokenholderDelegation']>, ParentType, ContextType, RequireFields<QuerytokenholderDelegationArgs, 'id' | 'subgraphError'>>;
    tokenholderDelegations?: Resolver<Array<ResolversTypes['TokenholderDelegation']>, ParentType, ContextType, RequireFields<QuerytokenholderDelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    daometric?: Resolver<Maybe<ResolversTypes['DAOMetric']>, ParentType, ContextType, RequireFields<QuerydaometricArgs, 'id' | 'subgraphError'>>;
    daometrics?: Resolver<Array<ResolversTypes['DAOMetric']>, ParentType, ContextType, RequireFields<QuerydaometricsArgs, 'skip' | 'first' | 'subgraphError'>>;
    tacoCommitment?: Resolver<Maybe<ResolversTypes['TACoCommitment']>, ParentType, ContextType, RequireFields<QuerytacoCommitmentArgs, 'id' | 'subgraphError'>>;
    tacoCommitments?: Resolver<Array<ResolversTypes['TACoCommitment']>, ParentType, ContextType, RequireFields<QuerytacoCommitmentsArgs, 'skip' | 'first' | 'subgraphError'>>;
    delegation?: Resolver<Maybe<ResolversTypes['Delegation']>, ParentType, ContextType, RequireFields<QuerydelegationArgs, 'id' | 'subgraphError'>>;
    delegations?: Resolver<Array<ResolversTypes['Delegation']>, ParentType, ContextType, RequireFields<QuerydelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
}>;
export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
    tacoOperator?: SubscriptionResolver<Maybe<ResolversTypes['TACoOperator']>, "tacoOperator", ParentType, ContextType, RequireFields<SubscriptiontacoOperatorArgs, 'id' | 'subgraphError'>>;
    tacoOperators?: SubscriptionResolver<Array<ResolversTypes['TACoOperator']>, "tacoOperators", ParentType, ContextType, RequireFields<SubscriptiontacoOperatorsArgs, 'skip' | 'first' | 'subgraphError'>>;
    _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
    account?: SubscriptionResolver<Maybe<ResolversTypes['Account']>, "account", ParentType, ContextType, RequireFields<SubscriptionaccountArgs, 'id' | 'subgraphError'>>;
    accounts?: SubscriptionResolver<Array<ResolversTypes['Account']>, "accounts", ParentType, ContextType, RequireFields<SubscriptionaccountsArgs, 'skip' | 'first' | 'subgraphError'>>;
    stakeData?: SubscriptionResolver<Maybe<ResolversTypes['StakeData']>, "stakeData", ParentType, ContextType, RequireFields<SubscriptionstakeDataArgs, 'id' | 'subgraphError'>>;
    stakeDatas?: SubscriptionResolver<Array<ResolversTypes['StakeData']>, "stakeDatas", ParentType, ContextType, RequireFields<SubscriptionstakeDatasArgs, 'skip' | 'first' | 'subgraphError'>>;
    epochStake?: SubscriptionResolver<Maybe<ResolversTypes['EpochStake']>, "epochStake", ParentType, ContextType, RequireFields<SubscriptionepochStakeArgs, 'id' | 'subgraphError'>>;
    epochStakes?: SubscriptionResolver<Array<ResolversTypes['EpochStake']>, "epochStakes", ParentType, ContextType, RequireFields<SubscriptionepochStakesArgs, 'skip' | 'first' | 'subgraphError'>>;
    epoch?: SubscriptionResolver<Maybe<ResolversTypes['Epoch']>, "epoch", ParentType, ContextType, RequireFields<SubscriptionepochArgs, 'id' | 'subgraphError'>>;
    epoches?: SubscriptionResolver<Array<ResolversTypes['Epoch']>, "epoches", ParentType, ContextType, RequireFields<SubscriptionepochesArgs, 'skip' | 'first' | 'subgraphError'>>;
    epochCounter?: SubscriptionResolver<Maybe<ResolversTypes['EpochCounter']>, "epochCounter", ParentType, ContextType, RequireFields<SubscriptionepochCounterArgs, 'id' | 'subgraphError'>>;
    epochCounters?: SubscriptionResolver<Array<ResolversTypes['EpochCounter']>, "epochCounters", ParentType, ContextType, RequireFields<SubscriptionepochCountersArgs, 'skip' | 'first' | 'subgraphError'>>;
    appAuthorization?: SubscriptionResolver<Maybe<ResolversTypes['AppAuthorization']>, "appAuthorization", ParentType, ContextType, RequireFields<SubscriptionappAuthorizationArgs, 'id' | 'subgraphError'>>;
    appAuthorizations?: SubscriptionResolver<Array<ResolversTypes['AppAuthorization']>, "appAuthorizations", ParentType, ContextType, RequireFields<SubscriptionappAuthorizationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    appAuthHistory?: SubscriptionResolver<Maybe<ResolversTypes['AppAuthHistory']>, "appAuthHistory", ParentType, ContextType, RequireFields<SubscriptionappAuthHistoryArgs, 'id' | 'subgraphError'>>;
    appAuthHistories?: SubscriptionResolver<Array<ResolversTypes['AppAuthHistory']>, "appAuthHistories", ParentType, ContextType, RequireFields<SubscriptionappAuthHistoriesArgs, 'skip' | 'first' | 'subgraphError'>>;
    minStakeAmount?: SubscriptionResolver<Maybe<ResolversTypes['MinStakeAmount']>, "minStakeAmount", ParentType, ContextType, RequireFields<SubscriptionminStakeAmountArgs, 'id' | 'subgraphError'>>;
    minStakeAmounts?: SubscriptionResolver<Array<ResolversTypes['MinStakeAmount']>, "minStakeAmounts", ParentType, ContextType, RequireFields<SubscriptionminStakeAmountsArgs, 'skip' | 'first' | 'subgraphError'>>;
    stakeDelegation?: SubscriptionResolver<Maybe<ResolversTypes['StakeDelegation']>, "stakeDelegation", ParentType, ContextType, RequireFields<SubscriptionstakeDelegationArgs, 'id' | 'subgraphError'>>;
    stakeDelegations?: SubscriptionResolver<Array<ResolversTypes['StakeDelegation']>, "stakeDelegations", ParentType, ContextType, RequireFields<SubscriptionstakeDelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    tokenholderDelegation?: SubscriptionResolver<Maybe<ResolversTypes['TokenholderDelegation']>, "tokenholderDelegation", ParentType, ContextType, RequireFields<SubscriptiontokenholderDelegationArgs, 'id' | 'subgraphError'>>;
    tokenholderDelegations?: SubscriptionResolver<Array<ResolversTypes['TokenholderDelegation']>, "tokenholderDelegations", ParentType, ContextType, RequireFields<SubscriptiontokenholderDelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
    daometric?: SubscriptionResolver<Maybe<ResolversTypes['DAOMetric']>, "daometric", ParentType, ContextType, RequireFields<SubscriptiondaometricArgs, 'id' | 'subgraphError'>>;
    daometrics?: SubscriptionResolver<Array<ResolversTypes['DAOMetric']>, "daometrics", ParentType, ContextType, RequireFields<SubscriptiondaometricsArgs, 'skip' | 'first' | 'subgraphError'>>;
    tacoCommitment?: SubscriptionResolver<Maybe<ResolversTypes['TACoCommitment']>, "tacoCommitment", ParentType, ContextType, RequireFields<SubscriptiontacoCommitmentArgs, 'id' | 'subgraphError'>>;
    tacoCommitments?: SubscriptionResolver<Array<ResolversTypes['TACoCommitment']>, "tacoCommitments", ParentType, ContextType, RequireFields<SubscriptiontacoCommitmentsArgs, 'skip' | 'first' | 'subgraphError'>>;
    delegation?: SubscriptionResolver<Maybe<ResolversTypes['Delegation']>, "delegation", ParentType, ContextType, RequireFields<SubscriptiondelegationArgs, 'id' | 'subgraphError'>>;
    delegations?: SubscriptionResolver<Array<ResolversTypes['Delegation']>, "delegations", ParentType, ContextType, RequireFields<SubscriptiondelegationsArgs, 'skip' | 'first' | 'subgraphError'>>;
}>;
export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
    name: 'BigDecimal';
}
export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
    name: 'BigInt';
}
export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
    name: 'Bytes';
}
export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
    name: 'Int8';
}
export type TACoOperatorResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TACoOperator'] = ResolversParentTypes['TACoOperator']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    operator?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    confirmedTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    confirmedTimestampFirstOperator?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
    confirmed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
    bondedTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    bondedTimestampFirstOperator?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
    hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
    number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
    block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
    deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type AccountResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    stakes?: Resolver<Maybe<Array<ResolversTypes['StakeData']>>, ParentType, ContextType, RequireFields<AccountstakesArgs, 'skip' | 'first'>>;
    delegatee?: Resolver<Maybe<ResolversTypes['TokenholderDelegation']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type AppAuthHistoryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['AppAuthHistory'] = ResolversParentTypes['AppAuthHistory']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    appAuthorization?: Resolver<ResolversTypes['AppAuthorization'], ParentType, ContextType>;
    amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    eventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type AppAuthorizationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['AppAuthorization'] = ResolversParentTypes['AppAuthorization']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    appAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    stake?: Resolver<ResolversTypes['StakeData'], ParentType, ContextType>;
    amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    amountDeauthorizingTo?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    appName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type DAOMetricResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['DAOMetric'] = ResolversParentTypes['DAOMetric']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    liquidTotal?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    stakedTotal?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type DelegationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Delegation'] = ResolversParentTypes['Delegation']> = ResolversObject<{
    __resolveType: TypeResolveFn<'StakeDelegation' | 'TokenholderDelegation', ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    totalWeight?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
}>;
export type EpochResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Epoch'] = ResolversParentTypes['Epoch']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    duration?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
    totalAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    stakes?: Resolver<Maybe<Array<ResolversTypes['EpochStake']>>, ParentType, ContextType, RequireFields<EpochstakesArgs, 'skip' | 'first'>>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type EpochCounterResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['EpochCounter'] = ResolversParentTypes['EpochCounter']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type EpochStakeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['EpochStake'] = ResolversParentTypes['EpochStake']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    epoch?: Resolver<ResolversTypes['Epoch'], ParentType, ContextType>;
    stakingProvider?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type MinStakeAmountResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['MinStakeAmount'] = ResolversParentTypes['MinStakeAmount']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type StakeDataResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['StakeData'] = ResolversParentTypes['StakeData']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
    beneficiary?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    authorizer?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
    tStake?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    keepInTStake?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    nuInTStake?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    totalStaked?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    delegatee?: Resolver<Maybe<ResolversTypes['StakeDelegation']>, ParentType, ContextType>;
    authorizations?: Resolver<Maybe<Array<ResolversTypes['AppAuthorization']>>, ParentType, ContextType, RequireFields<StakeDataauthorizationsArgs, 'skip' | 'first'>>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type StakeDelegationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['StakeDelegation'] = ResolversParentTypes['StakeDelegation']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    totalWeight?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    stakeDelegators?: Resolver<Maybe<Array<ResolversTypes['StakeData']>>, ParentType, ContextType, RequireFields<StakeDelegationstakeDelegatorsArgs, 'skip' | 'first'>>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type TACoCommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TACoCommitment'] = ResolversParentTypes['TACoCommitment']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    endCommitment?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type TokenholderDelegationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TokenholderDelegation'] = ResolversParentTypes['TokenholderDelegation']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    totalWeight?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    liquidWeight?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    delegators?: Resolver<Maybe<Array<ResolversTypes['Account']>>, ParentType, ContextType, RequireFields<TokenholderDelegationdelegatorsArgs, 'skip' | 'first'>>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type Resolvers<ContextType = MeshContext> = ResolversObject<{
    Query?: QueryResolvers<ContextType>;
    Subscription?: SubscriptionResolvers<ContextType>;
    BigDecimal?: GraphQLScalarType;
    BigInt?: GraphQLScalarType;
    Bytes?: GraphQLScalarType;
    Int8?: GraphQLScalarType;
    TACoOperator?: TACoOperatorResolvers<ContextType>;
    _Block_?: _Block_Resolvers<ContextType>;
    _Meta_?: _Meta_Resolvers<ContextType>;
    Account?: AccountResolvers<ContextType>;
    AppAuthHistory?: AppAuthHistoryResolvers<ContextType>;
    AppAuthorization?: AppAuthorizationResolvers<ContextType>;
    DAOMetric?: DAOMetricResolvers<ContextType>;
    Delegation?: DelegationResolvers<ContextType>;
    Epoch?: EpochResolvers<ContextType>;
    EpochCounter?: EpochCounterResolvers<ContextType>;
    EpochStake?: EpochStakeResolvers<ContextType>;
    MinStakeAmount?: MinStakeAmountResolvers<ContextType>;
    StakeData?: StakeDataResolvers<ContextType>;
    StakeDelegation?: StakeDelegationResolvers<ContextType>;
    TACoCommitment?: TACoCommitmentResolvers<ContextType>;
    TokenholderDelegation?: TokenholderDelegationResolvers<ContextType>;
}>;
export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
    entity?: entityDirectiveResolver<any, any, ContextType>;
    subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
    derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;
export type MeshContext = ThresholdStakingPolygonTypes.Context & DevelopmentThresholdSubgraphTypes.Context & BaseMeshContext;
export declare const rawServeConfig: YamlConfig.Config['serve'];
export declare function getMeshOptions(): Promise<GetMeshOptions>;
export declare function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext>;
export declare function getBuiltGraphClient(): Promise<MeshInstance>;
export declare const execute: ExecuteMeshFn;
export declare const subscribe: SubscribeMeshFn;
export declare function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext): {
    LegacyKeepStakesQuery(variables?: Exact<{
        blockNumber?: number;
    }>, options?: TOperationContext): Promise<LegacyKeepStakesQueryQuery>;
    TACoAuthHistoryQuery(variables?: Exact<{
        endTimestamp?: any;
        first?: number;
        skip?: number;
    }>, options?: TOperationContext): Promise<TACoAuthHistoryQueryQuery>;
    TACoOperators(variables?: Exact<{
        endTimestamp?: any;
        first?: number;
        skip?: number;
    }>, options?: TOperationContext): Promise<TACoOperatorsQuery>;
};
export type LegacyKeepStakesQueryQueryVariables = Exact<{
    blockNumber?: InputMaybe<Scalars['Int']>;
}>;
export type LegacyKeepStakesQueryQuery = {
    accounts: Array<(Pick<Account, 'id'> & {
        stakes?: Maybe<Array<Pick<StakeData, 'id' | 'keepInTStake' | 'tStake' | 'totalStaked'>>>;
    })>;
};
export type TACoAuthHistoryQueryQueryVariables = Exact<{
    endTimestamp?: InputMaybe<Scalars['BigInt']>;
    first?: InputMaybe<Scalars['Int']>;
    skip?: InputMaybe<Scalars['Int']>;
}>;
export type TACoAuthHistoryQueryQuery = {
    appAuthHistories: Array<(Pick<AppAuthHistory, 'id' | 'timestamp' | 'amount' | 'blockNumber' | 'eventType'> & {
        appAuthorization: {
            stake: Pick<StakeData, 'id' | 'beneficiary'>;
        };
    })>;
};
export type TACoOperatorsQueryVariables = Exact<{
    endTimestamp?: InputMaybe<Scalars['BigInt']>;
    first?: InputMaybe<Scalars['Int']>;
    skip?: InputMaybe<Scalars['Int']>;
}>;
export type TACoOperatorsQuery = {
    tacoOperators: Array<Pick<TACoOperator, 'id' | 'operator' | 'confirmedTimestampFirstOperator'>>;
};
export declare const LegacyKeepStakesQueryDocument: DocumentNode<LegacyKeepStakesQueryQuery, Exact<{
    blockNumber?: InputMaybe<Scalars['Int']>;
}>>;
export declare const TACoAuthHistoryQueryDocument: DocumentNode<TACoAuthHistoryQueryQuery, Exact<{
    endTimestamp?: InputMaybe<Scalars['BigInt']>;
    first?: InputMaybe<Scalars['Int']>;
    skip?: InputMaybe<Scalars['Int']>;
}>>;
export declare const TACoOperatorsDocument: DocumentNode<TACoOperatorsQuery, Exact<{
    endTimestamp?: InputMaybe<Scalars['BigInt']>;
    first?: InputMaybe<Scalars['Int']>;
    skip?: InputMaybe<Scalars['Int']>;
}>>;
export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>;
export declare function getSdk<C, E>(requester: Requester<C, E>): {
    LegacyKeepStakesQuery(variables?: LegacyKeepStakesQueryQueryVariables, options?: C): Promise<LegacyKeepStakesQueryQuery>;
    TACoAuthHistoryQuery(variables?: TACoAuthHistoryQueryQueryVariables, options?: C): Promise<TACoAuthHistoryQueryQuery>;
    TACoOperators(variables?: TACoOperatorsQueryVariables, options?: C): Promise<TACoOperatorsQuery>;
};
export type Sdk = ReturnType<typeof getSdk>;
