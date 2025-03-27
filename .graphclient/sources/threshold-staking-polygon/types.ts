// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace ThresholdStakingPolygonTypes {
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
  Timestamp: any;
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
  tacoOperator?: Maybe<TACoOperator>;
  tacoOperators: Array<TACoOperator>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
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

export type Subscription = {
  tacoOperator?: Maybe<TACoOperator>;
  tacoOperators: Array<TACoOperator>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
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
};

export type TACoOperator_orderBy =
  | 'id'
  | 'operator'
  | 'confirmedTimestamp'
  | 'confirmedTimestampFirstOperator'
  | 'confirmed';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
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
  tacoOperator: InContextSdkMethod<Query['tacoOperator'], QuerytacoOperatorArgs, MeshContext>,
  /** null **/
  tacoOperators: InContextSdkMethod<Query['tacoOperators'], QuerytacoOperatorsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  tacoOperator: InContextSdkMethod<Subscription['tacoOperator'], SubscriptiontacoOperatorArgs, MeshContext>,
  /** null **/
  tacoOperators: InContextSdkMethod<Subscription['tacoOperators'], SubscriptiontacoOperatorsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["threshold-staking-polygon"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
