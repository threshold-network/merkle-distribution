# Threshold Network rewards Merkle distribution

Solidity contract and scripts for Threshold Network rewards distribution.

In the Cumulative Merkle Drop contract, each new token distribution replaces the previous one and
contains the cumulative balances of all the participants. The cumulative claimed amount used in
the contract will track the amount already claimed for each stake.

The `distributions` folder contains the reward distributions already released.

The `src` folder contains scripts to generate a new rewards distribution or to claim the rewards.

## Installation

To run the scripts, it is needed to have installed node version > 18 and NPM.

```bash
npm install
```

> **NOTE:** Scripts must be run from the repo root path, and not from the folder that contains them.

## Claiming rewards script

We encourage you to use the [Threshold Network dashboard](https://dashboard.threshold.network/staking)
to claim staking rewards.

Alternatively, you can use the HardHat task `claim-rewards`:

A `.env` file must be set with the following parameters:

```
MAINNET_PRIVATE_KEY=<CLAIMER_ACCOUNT_PRIVATE_KEY>
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<API_KEY>
FORKING_URL=https://eth-mainnet.g.alchemy.com/v2/<API_KEY>
```

- `MAINNET_PRIVATE_KEY`: the private key of the claimer account. Any Ethereum account can claim the
  rewards, regardless of whether this account belongs to the Threshold Network or not. Note that
  staking rewards will be sent to its beneficiary address, and not to the claimer account. Claiming
  will spend some gas to make the transactions, so the claimer account must have some ether.
- `MAINNET_RPC_URL`: Alchemy or Infura are recommended.
- `FORKING_URL` is optional since it is used only for testing the claiming in the HardHat local
  network. It is necessary to use an archive node, so Alchemy is recommended.


#### Usage:

To get help:

```bash
npx hardhat claim-rewards --help
```

```bash
npx hardhat [--network <network>] claim-rewards [--beneficiary <address>] [--staking-provider <address>]
```

#### Examples:

- Claim rewards by _staking provider_ address:

```bash
npx hardhat --network mainnet claim-rewards \
  --staking-provider 0xc2d9433D3dC58881a6F8e0A0448Ce191B838f7DA
```

- Claim rewards by _beneficiary_ address. All the staking rewards with this address as beneficiary
  will be claimed:

```bash
npx hardhat --network mainnet claim-rewards \
  --beneficiary 0xB63853FaD9533AB4518dD1a5FA21bE2988D66508
```

- Combine _staking provider_ and _beneficiary_:

```bash
npx hardhat --network mainnet claim-rewards \
  --staking-provider 0xc2d9433D3dC58881a6F8e0A0448Ce191B838f7DA \
  --beneficiary 0xB63853FaD9533AB4518dD1a5FA21bE2988D66508
```

- If no network is specified, the transaction will be executed in test mode: HardHat local network
that forks with the mainnet current stake will be used. This can be useful to know if the
transaction execution will be correct without actually sending the transaction.

```bash
npx hardhat claim-rewards \
  --staking-provider 0xc2d9433D3dC58881a6F8e0A0448Ce191B838f7DA
```

## Rewards distribution generation script

A `.env` file must be set with the following parameters:

```
ETHERSCAN_TOKEN=<your Etherscan API token>
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/<API_KEY>
```

This script calculates the Threshold Network rewards earned during a specific period, adds them to
the previous distributions, and generates a new distribution that contains the cumulative rewards.

```bash
node src/scripts/gen_rewards_dist.js
```

Note that some script's parameters (rewards weights, start time, end time, last distribution path)
must be replaced in the script before running it.

### Valid versions

Additionally, the tBTC client valid versions must be specified. The `tbtcValidVersions` variable
must be set for each distribution release. The versions must be specified following this schema:

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

### Contributions

This script uses [subgraphs](https://thegraph.com/explorer) for querying data about stakes and
calculating the appropriate rewards. These subgraphs are queried using
(`graph-client`)[https://thegraph.com/docs/en/querying/graph-client/README/] since this library
supports auto-pagination, retry, fallback, etc.

Modification or addition of new subgraphs must be done in `.graphclientrc.yml`. Also, new queries
must be added to this file in addition to the `src/script/graphql` folder.

Every time the subgraph queries are modified, these must be recompiled:

```bash
yarn graphclient build --fileType json
```

## Contracts development

### Testing

To compile the contracts, just run:

```bash
npx hardhat compile
```

To run the tests just run:

```bash
npx hardhat test
```
