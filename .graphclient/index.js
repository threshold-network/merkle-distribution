"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.TACoOperatorsDocument = exports.TACoAuthHistoryQueryDocument = exports.StakeHistoryBetweenTwoDatesQueryDocument = exports.PREOpsBeforeLegacyDeactQueryDocument = exports.getBuiltGraphSDK = exports.subscribe = exports.execute = exports.getBuiltGraphClient = exports.createBuiltMeshHTTPHandler = exports.getMeshOptions = exports.rawServeConfig = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("@graphql-mesh/utils");
const utils_2 = require("@graphql-mesh/utils");
const utils_3 = require("@graphql-mesh/utils");
const cache_localforage_1 = tslib_1.__importDefault(require("@graphql-mesh/cache-localforage"));
const fetch_1 = require("@whatwg-node/fetch");
const graphql_1 = tslib_1.__importDefault(require("@graphql-mesh/graphql"));
const client_auto_pagination_1 = tslib_1.__importDefault(require("@graphprotocol/client-auto-pagination"));
const merger_stitching_1 = tslib_1.__importDefault(require("@graphql-mesh/merger-stitching"));
const utils_4 = require("@graphql-mesh/utils");
const http_1 = require("@graphql-mesh/http");
const runtime_1 = require("@graphql-mesh/runtime");
const store_1 = require("@graphql-mesh/store");
const cross_helpers_1 = require("@graphql-mesh/cross-helpers");
const importedModule$0 = tslib_1.__importStar(require("./sources/simple/introspectionSchema.json"));
const importedModule$1 = tslib_1.__importStar(require("./sources/threshold-staking-polygon/introspectionSchema.json"));
const importedModule$2 = tslib_1.__importStar(require("./sources/development-threshold-subgraph/introspectionSchema.json"));
const baseDir = cross_helpers_1.path.join(typeof __dirname === 'string' ? __dirname : '/', '..');
const importFn = (moduleId) => {
    const relativeModuleId = (cross_helpers_1.path.isAbsolute(moduleId) ? cross_helpers_1.path.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
    switch (relativeModuleId) {
        case ".graphclient/sources/simple/introspectionSchema.json":
            return Promise.resolve(importedModule$0);
        case ".graphclient/sources/threshold-staking-polygon/introspectionSchema.json":
            return Promise.resolve(importedModule$1);
        case ".graphclient/sources/development-threshold-subgraph/introspectionSchema.json":
            return Promise.resolve(importedModule$2);
        default:
            return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
    }
};
const rootStore = new store_1.MeshStore('.graphclient', new store_1.FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: "json",
}), {
    readonly: true,
    validate: false
});
exports.rawServeConfig = undefined;
async function getMeshOptions() {
    const pubsub = new utils_2.PubSub();
    const sourcesStore = rootStore.child('sources');
    const logger = new utils_3.DefaultLogger("GraphClient");
    const cache = new cache_localforage_1.default({
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
    const developmentThresholdSubgraphHandler = new graphql_1.default({
        name: "development-threshold-subgraph",
        config: { "endpoint": "https://subgraph.satsuma-prod.com/276a55924ce0/nucypher--102994/mainnet/api" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("development-threshold-subgraph"),
        logger: logger.child("development-threshold-subgraph"),
        importFn,
    });
    const thresholdStakingPolygonHandler = new graphql_1.default({
        name: "threshold-staking-polygon",
        config: { "endpoint": "https://api.studio.thegraph.com/query/24143/threshold-staking-polygon/0.1.1" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("threshold-staking-polygon"),
        logger: logger.child("threshold-staking-polygon"),
        importFn,
    });
    const simpleHandler = new graphql_1.default({
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
    developmentThresholdSubgraphTransforms[0] = new client_auto_pagination_1.default({
        apiName: "development-threshold-subgraph",
        config: { "validateSchema": true },
        baseDir,
        cache,
        pubsub,
        importFn,
        logger,
    });
    thresholdStakingPolygonTransforms[0] = new client_auto_pagination_1.default({
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
    const merger = new merger_stitching_1.default({
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
                    document: PreOpsBeforeLegacyDeactQueryDocument,
                    get rawSDL() {
                        return (0, utils_4.printWithCache)(PreOpsBeforeLegacyDeactQueryDocument);
                    },
                    location: 'PreOpsBeforeLegacyDeactQueryDocument.graphql'
                }, {
                    document: exports.StakeHistoryBetweenTwoDatesQueryDocument,
                    get rawSDL() {
                        return (0, utils_4.printWithCache)(exports.StakeHistoryBetweenTwoDatesQueryDocument);
                    },
                    location: 'StakeHistoryBetweenTwoDatesQueryDocument.graphql'
                }, {
                    document: TaCoAuthHistoryQueryDocument,
                    get rawSDL() {
                        return (0, utils_4.printWithCache)(TaCoAuthHistoryQueryDocument);
                    },
                    location: 'TaCoAuthHistoryQueryDocument.graphql'
                }, {
                    document: TaCoOperatorsDocument,
                    get rawSDL() {
                        return (0, utils_4.printWithCache)(TaCoOperatorsDocument);
                    },
                    location: 'TaCoOperatorsDocument.graphql'
                }
            ];
        },
        fetchFn: fetch_1.fetch,
    };
}
exports.getMeshOptions = getMeshOptions;
function createBuiltMeshHTTPHandler() {
    return (0, http_1.createMeshHTTPHandler)({
        baseDir,
        getBuiltMesh: getBuiltGraphClient,
        rawServeConfig: undefined,
    });
}
exports.createBuiltMeshHTTPHandler = createBuiltMeshHTTPHandler;
let meshInstance$;
function getBuiltGraphClient() {
    if (meshInstance$ == null) {
        meshInstance$ = getMeshOptions().then(meshOptions => (0, runtime_1.getMesh)(meshOptions)).then(mesh => {
            const id = mesh.pubsub.subscribe('destroy', () => {
                meshInstance$ = undefined;
                mesh.pubsub.unsubscribe(id);
            });
            return mesh;
        });
    }
    return meshInstance$;
}
exports.getBuiltGraphClient = getBuiltGraphClient;
const execute = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));
exports.execute = execute;
const subscribe = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
exports.subscribe = subscribe;
function getBuiltGraphSDK(globalContext) {
    const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
    return getSdk((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
exports.getBuiltGraphSDK = getBuiltGraphSDK;
exports.PREOpsBeforeLegacyDeactQueryDocument = (0, utils_1.gql) `
    query PREOpsBeforeLegacyDeactQuery($blockNumber: Int) {
  simplePREApplications(first: 1000, block: {number: $blockNumber}) {
    id
    operator
    confirmedTimestamp
  }
}
    `;
exports.StakeHistoryBetweenTwoDatesQueryDocument = (0, utils_1.gql) `
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
exports.TACoAuthHistoryQueryDocument = (0, utils_1.gql) `
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
exports.TACoOperatorsDocument = (0, utils_1.gql) `
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
function getSdk(requester) {
    return {
        PREOpsBeforeLegacyDeactQuery(variables, options) {
            return requester(exports.PREOpsBeforeLegacyDeactQueryDocument, variables, options);
        },
        StakeHistoryBetweenTwoDatesQuery(variables, options) {
            return requester(exports.StakeHistoryBetweenTwoDatesQueryDocument, variables, options);
        },
        TACoAuthHistoryQuery(variables, options) {
            return requester(exports.TACoAuthHistoryQueryDocument, variables, options);
        },
        TACoOperators(variables, options) {
            return requester(exports.TACoOperatorsDocument, variables, options);
        }
    };
}
exports.getSdk = getSdk;
