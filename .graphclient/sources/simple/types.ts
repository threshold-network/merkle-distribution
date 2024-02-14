// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace SimpleTypes {
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

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  simplePREApplication?: Maybe<SimplePREApplication>;
  simplePREApplications: Array<SimplePREApplication>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QuerysimplePREApplicationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerysimplePREApplicationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SimplePREApplication_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<SimplePREApplication_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

/** SimplePREApplication represents the state of Simple Proxy ReEncryption operators */
export type SimplePREApplication = {
  /** ID is the staking provider ETH address */
  id: Scalars['ID'];
  /** Operator's ETH address */
  operator: Scalars['Bytes'];
  /** Stake address related to this PRE operator */
  stake: Scalars['Bytes'];
  /** UNIX timestamp in which an operator was bonded for this staking provider for first time */
  bondedTimestamp?: Maybe<Scalars['BigInt']>;
  /** UNIX timestamp in which an operator was confirmed for this staking provider for first time */
  confirmedTimestamp?: Maybe<Scalars['BigInt']>;
};

export type SimplePREApplication_filter = {
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
  stake?: InputMaybe<Scalars['Bytes']>;
  stake_not?: InputMaybe<Scalars['Bytes']>;
  stake_gt?: InputMaybe<Scalars['Bytes']>;
  stake_lt?: InputMaybe<Scalars['Bytes']>;
  stake_gte?: InputMaybe<Scalars['Bytes']>;
  stake_lte?: InputMaybe<Scalars['Bytes']>;
  stake_in?: InputMaybe<Array<Scalars['Bytes']>>;
  stake_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  stake_contains?: InputMaybe<Scalars['Bytes']>;
  stake_not_contains?: InputMaybe<Scalars['Bytes']>;
  bondedTimestamp?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  bondedTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bondedTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  confirmedTimestamp?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  confirmedTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  confirmedTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<SimplePREApplication_filter>>>;
  or?: InputMaybe<Array<InputMaybe<SimplePREApplication_filter>>>;
};

export type SimplePREApplication_orderBy =
  | 'id'
  | 'operator'
  | 'stake'
  | 'bondedTimestamp'
  | 'confirmedTimestamp';

export type Subscription = {
  simplePREApplication?: Maybe<SimplePREApplication>;
  simplePREApplications: Array<SimplePREApplication>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionsimplePREApplicationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionsimplePREApplicationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SimplePREApplication_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<SimplePREApplication_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

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
  simplePREApplication: InContextSdkMethod<Query['simplePREApplication'], QuerysimplePREApplicationArgs, MeshContext>,
  /** null **/
  simplePREApplications: InContextSdkMethod<Query['simplePREApplications'], QuerysimplePREApplicationsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  simplePREApplication: InContextSdkMethod<Subscription['simplePREApplication'], SubscriptionsimplePREApplicationArgs, MeshContext>,
  /** null **/
  simplePREApplications: InContextSdkMethod<Subscription['simplePREApplications'], SubscriptionsimplePREApplicationsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["simple"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
