import { gql } from '@graphql-mesh/utils';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';
import GraphqlHandler from "@graphql-mesh/graphql";
import AutoPaginationTransform from "@graphprotocol/client-auto-pagination";
import StitchingMerger from "@graphql-mesh/merger-stitching";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import * as importedModule$0 from "./sources/threshold-staking-polygon/introspectionSchema.json";
import * as importedModule$1 from "./sources/development-threshold-subgraph/introspectionSchema.json";
import * as importedModule$2 from "./sources/simple/introspectionSchema.json";
import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');
const importFn = (moduleId) => {
    const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
    switch (relativeModuleId) {
        case ".graphclient/sources/threshold-staking-polygon/introspectionSchema.json":
            return Promise.resolve(importedModule$0);
        case ".graphclient/sources/development-threshold-subgraph/introspectionSchema.json":
            return Promise.resolve(importedModule$1);
        case ".graphclient/sources/simple/introspectionSchema.json":
            return Promise.resolve(importedModule$2);
        default:
            return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
    }
};
const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: "json",
}), {
    readonly: true,
    validate: false
});
export const rawServeConfig = undefined;
export async function getMeshOptions() {
    const pubsub = new PubSub();
    const sourcesStore = rootStore.child('sources');
    const logger = new DefaultLogger("GraphClient");
    const cache = new MeshCache({
        ...{},
        importFn,
        store: rootStore.child('cache'),
        pubsub,
        logger,
    });
    const sources = [];
    const transforms = [];
    const additionalEnvelopPlugins = [];
    const developmentThresholdSubgraphTransforms = [];
    const thresholdStakingPolygonTransforms = [];
    const simpleTransforms = [];
    const additionalTypeDefs = [];
    const developmentThresholdSubgraphHandler = new GraphqlHandler({
        name: "development-threshold-subgraph",
        config: { "endpoint": "https://subgraph.satsuma-prod.com/276a55924ce0/nucypher--102994/mainnet/api" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("development-threshold-subgraph"),
        logger: logger.child("development-threshold-subgraph"),
        importFn,
    });
    const thresholdStakingPolygonHandler = new GraphqlHandler({
        name: "threshold-staking-polygon",
        config: { "endpoint": "https://api.studio.thegraph.com/query/24143/threshold-staking-polygon/0.1.1" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("threshold-staking-polygon"),
        logger: logger.child("threshold-staking-polygon"),
        importFn,
    });
    const simpleHandler = new GraphqlHandler({
        name: "simple",
        config: { "endpoint": "https://api.studio.thegraph.com/query/24143/simple-pre-application/version/latest" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("simple"),
        logger: logger.child("simple"),
        importFn,
    });
    sources[2] = {
        name: 'simple',
        handler: simpleHandler,
        transforms: simpleTransforms
    };
    developmentThresholdSubgraphTransforms[0] = new AutoPaginationTransform({
        apiName: "development-threshold-subgraph",
        config: { "validateSchema": true },
        baseDir,
        cache,
        pubsub,
        importFn,
        logger,
    });
    thresholdStakingPolygonTransforms[0] = new AutoPaginationTransform({
        apiName: "threshold-staking-polygon",
        config: { "validateSchema": true },
        baseDir,
        cache,
        pubsub,
        importFn,
        logger,
    });
    sources[0] = {
        name: 'development-threshold-subgraph',
        handler: developmentThresholdSubgraphHandler,
        transforms: developmentThresholdSubgraphTransforms
    };
    sources[1] = {
        name: 'threshold-staking-polygon',
        handler: thresholdStakingPolygonHandler,
        transforms: thresholdStakingPolygonTransforms
    };
    const additionalResolvers = [];
    const merger = new StitchingMerger({
        cache,
        pubsub,
        logger: logger.child('stitchingMerger'),
        store: rootStore.child('stitchingMerger')
    });
    return {
        sources,
        transforms,
        additionalTypeDefs,
        additionalResolvers,
        cache,
        pubsub,
        merger,
        logger,
        additionalEnvelopPlugins,
        get documents() {
            return [
                {
                    document: RbAuthHistoryQueryDocument,
                    get rawSDL() {
                        return printWithCache(RbAuthHistoryQueryDocument);
                    },
                    location: 'RbAuthHistoryQueryDocument.graphql'
                }, {
                    document: TbtcAuthHistoryQueryDocument,
                    get rawSDL() {
                        return printWithCache(TbtcAuthHistoryQueryDocument);
                    },
                    location: 'TbtcAuthHistoryQueryDocument.graphql'
                }, {
                    document: TacoAuthHistoryQueryDocument,
                    get rawSDL() {
                        return printWithCache(TacoAuthHistoryQueryDocument);
                    },
                    location: 'TacoAuthHistoryQueryDocument.graphql'
                }, {
                    document: PreOpsBeforeLegacyDeactQueryDocument,
                    get rawSDL() {
                        return printWithCache(PreOpsBeforeLegacyDeactQueryDocument);
                    },
                    location: 'PreOpsBeforeLegacyDeactQueryDocument.graphql'
                }, {
                    document: StakeHistoryBetweenTwoDatesQueryDocument,
                    get rawSDL() {
                        return printWithCache(StakeHistoryBetweenTwoDatesQueryDocument);
                    },
                    location: 'StakeHistoryBetweenTwoDatesQueryDocument.graphql'
                }, {
                    document: TaCoAuthHistoryQueryDocument,
                    get rawSDL() {
                        return printWithCache(TaCoAuthHistoryQueryDocument);
                    },
                    location: 'TaCoAuthHistoryQueryDocument.graphql'
                }, {
                    document: TaCoOperatorsDocument,
                    get rawSDL() {
                        return printWithCache(TaCoOperatorsDocument);
                    },
                    location: 'TaCoOperatorsDocument.graphql'
                }
            ];
        },
        fetchFn,
    };
}
export function createBuiltMeshHTTPHandler() {
    return createMeshHTTPHandler({
        baseDir,
        getBuiltMesh: getBuiltGraphClient,
        rawServeConfig: undefined,
    });
}
let meshInstance$;
export function getBuiltGraphClient() {
    if (meshInstance$ == null) {
        meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
            const id = mesh.pubsub.subscribe('destroy', () => {
                meshInstance$ = undefined;
                mesh.pubsub.unsubscribe(id);
            });
            return mesh;
        });
    }
    return meshInstance$;
}
export const execute = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));
export const subscribe = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK(globalContext) {
    const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
    return getSdk((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export const RBAuthHistoryQueryDocument = gql `
    query RBAuthHistoryQuery($startTimestamp: BigInt, $endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  appAuthHistories(
    where: {timestamp_gte: $startTimestamp, timestamp_lt: $endTimestamp, appAuthorization_: {appName: "Random Beacon"}}
    first: $first
    skip: $skip
  ) {
    timestamp
    amount
    eventAmount
    blockNumber
    eventType
    appAuthorization {
      stake {
        id
        beneficiary
      }
      appName
    }
  }
}
    `;
export const TbtcAuthHistoryQueryDocument = gql `
    query TbtcAuthHistoryQuery($startTimestamp: BigInt, $endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  appAuthHistories(
    where: {timestamp_gte: $startTimestamp, timestamp_lt: $endTimestamp, appAuthorization_: {appName: "tBTC"}}
    first: $first
    skip: $skip
  ) {
    timestamp
    amount
    eventAmount
    blockNumber
    eventType
    appAuthorization {
      stake {
        id
        beneficiary
      }
      appName
    }
  }
}
    `;
export const TACOAuthHistoryQueryDocument = gql `
    query TACOAuthHistoryQuery($startTimestamp: BigInt, $endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  appAuthHistories(
    where: {timestamp_gte: $startTimestamp, timestamp_lt: $endTimestamp, appAuthorization_: {appName: "TACo"}}
    first: $first
    skip: $skip
  ) {
    timestamp
    amount
    eventAmount
    blockNumber
    eventType
    appAuthorization {
      stake {
        id
        beneficiary
      }
      appName
    }
  }
}
    `;
export const PREOpsBeforeLegacyDeactQueryDocument = gql `
    query PREOpsBeforeLegacyDeactQuery($blockNumber: Int) {
  simplePREApplications(first: 1000, block: {number: $blockNumber}) {
    id
    operator
    confirmedTimestamp
  }
}
    `;
export const StakeHistoryBetweenTwoDatesQueryDocument = gql `
    query StakeHistoryBetweenTwoDatesQuery($startTimestamp: BigInt, $endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  stakeDatas(first: $first, skip: $skip) {
    id
    beneficiary
    stakeHistory(
      where: {timestamp_gte: $startTimestamp, timestamp_lt: $endTimestamp}
    ) {
      stakedAmount
      timestamp
      eventType
      blockNumber
      eventAmount
    }
  }
}
    `;
export const TACoAuthHistoryQueryDocument = gql `
    query TACoAuthHistoryQuery($endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  appAuthHistories(
    where: {timestamp_lte: $endTimestamp, appAuthorization_: {appName: "TACo"}}
    first: $first
    skip: $skip
  ) {
    id
    timestamp
    amount
    blockNumber
    eventType
    appAuthorization {
      stake {
        id
        beneficiary
      }
    }
  }
}
    `;
export const TACoOperatorsDocument = gql `
    query TACoOperators($endTimestamp: BigInt, $first: Int = 1000, $skip: Int = 0) {
  tacoOperators(
    where: {confirmedTimestampFirstOperator_lte: $endTimestamp}
    first: $first
    skip: $skip
  ) {
    id
    operator
    confirmedTimestampFirstOperator
  }
}
    `;
export function getSdk(requester) {
    return {
        RBAuthHistoryQuery(variables, options) {
            return requester(RBAuthHistoryQueryDocument, variables, options);
        },
        TbtcAuthHistoryQuery(variables, options) {
            return requester(TbtcAuthHistoryQueryDocument, variables, options);
        },
        TACOAuthHistoryQuery(variables, options) {
            return requester(TACOAuthHistoryQueryDocument, variables, options);
        },
        PREOpsBeforeLegacyDeactQuery(variables, options) {
            return requester(PREOpsBeforeLegacyDeactQueryDocument, variables, options);
        },
        StakeHistoryBetweenTwoDatesQuery(variables, options) {
            return requester(StakeHistoryBetweenTwoDatesQueryDocument, variables, options);
        },
        TACoAuthHistoryQuery(variables, options) {
            return requester(TACoAuthHistoryQueryDocument, variables, options);
        },
        TACoOperators(variables, options) {
            return requester(TACoOperatorsDocument, variables, options);
        }
    };
}
