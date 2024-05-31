# Threshold Network tBTCv2 rewards requirements

## Beacon Authorization

Random Beacon App must be authorized

## tBTC Authorization

tBTC App must be authorized

## Up time

Instances must be up at least 96% of time in a given rewards interval

## Pre params

The average number of generated pre-params should be no less than 500 in a given
rewards interval

## Client build version

Node operators must stay updated with the latest keep-core client releases to
receive rewards. The cutoff day for a new version is specified with
`--valid-versions` parameter following this schema:

The versions must be specified following this schema:

```
<version1>|<version2>_<version2Deadline>|<version3>_<version3Dealine> ...
```

Where:

- The versions must be sorted from latest to oldest.
- <versionDeadline> is the deadline in UNIX timestamp until the version is valid.

Examples:

- For this release distribution, only v2.1.0 (and patch versions v2.1.1, v2.1.2, etc) are valid:

```js
const tbtcValidVersions = "v2.1.0"
```

- We are calculating June 2024 rewards. v2.1.x is the current version and v2.0.x is valid until
2024-06-15:

```js
const tbtcValidVersions = "v2.1.0|v2.0.0_1718409600"
```

- We are calculating June 2024 rewards. v2.2.x is the current version. v2.1.x is valid until
2024-06-20. v2.0.x is valid until 2024-06-10:

```js
const tbtcValidVersions = "v2.2.0|v2.1.0_1718841600|v2.0.0_1717977600"
```
