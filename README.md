# Threshold Network rewards Merkle distribution

Solidity contract and scripts for Threshold Network rewards' distribution.

In Cumulative Merkle Drop contract, each new token distribution replaces previous one and should
contain the cumulative balances of all the participants. Cumulative claimed amount is used as
invalidation for every participant.

## Structure

- `contracts`: Source code for contract
- `test`: Hardhat contract tests.
- `src/scripts`:
  - `gen_rewards_dist.js`: generate new Merkle distribution for the Threshold Network rewards earned
    in a specific period.
  - `verify_proof.js`: verify Merkle proof of a distribution.
  - `stake_history.js`: fetch the information of a particular staker, including staking history.
  - `claimed_rewards.js`: calculate the Threshold rewards that has been already claimed.
- `distributions`:Threshold staking rewards' distributions. Here it is contained the Merkle Root of
  each distribution and the cumulative rewards earned by each stake.
  - `YYYY-MM-DD/MerkleDist.json`: include the Merkle distribution itself: every stake that earned
    rewards and its Merkle proofs. Also includes the Merkle Root. The amount shown here is the
    accumulation of rewards earned over time.
  - `YYYY-MM-DD/MerkleInput[].json`: include the rewards earned over time for each Threshold
    application plus [bonus
    rewards](https://forum.threshold.network/t/tip-020-interim-era-incentive-schemes-1-one-off-migration-stake-bonus-2-ongoing-stable-yield/297).
  - `distributions.json`: include the cumulative rewards earned by all stakes shown on a monthly
    basis.

## Installation

```bash
npm install
```

In order to run the scripts, it's needed to have a `.env` file that includes:

```
ETHERSCAN_TOKEN=<your Etherscan API token>
```

## Claiming rewards

We encourage you to use the [Threshold Network dashboard](https://dashboard.threshold.network/staking)
to claim staking rewards.

Alternatively, you can use the HardHat task `claim-rewards`:

### Configuration

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
- `FORKING_URL` is optional since it is used only for testing the claiming in HardHat local network.
  It is necessary to use an archive node, so Alchemy is recommended.

### Run claim-rewards

To get help:

```bash
npx hardhat claim-rewards --help
```

#### Usage:

```bash
npx hardhat [--network <network>] claim-rewards \
  [--beneficiary <address>] [--staking-provider <address>]
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

- If no network is specified, the transaction will be executed in HardHat local network but using
  mainnet current state. This can be useful for testing:

```bash
npx hardhat claim-rewards \
  --staking-provider 0xc2d9433D3dC58881a6F8e0A0448Ce191B838f7DA
```

## Run scripts

> **NOTE:** Scripts must be run from the repo root, and not from the folder that contains them.

### gen_rewards_dist script

This script calculates the Threshold Network rewards earned during a specific period, adds them to
the previous distributions, and generates a new distribution that contains the cumulative rewards.

A Subgraph API key is necessary to use this script. Nowadays The Graph protocol rewards with 1000
free queries if they [create a new API key](https://thegraph.com/studio/apikeys/). The amount of
queries made in each script's execution is under 40. The API key must be set in `.env` file:

```
SUBGRAPH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Note that some script's parameters (rewards weights, start time, end time, last distribution path...) must be changed in the script before running it.

```bash
node src/scripts/gen_rewards_dist.js
```

### stake_history script

This script fetches the information of a particular staker, including staking history.

```bash
node src/scripts/stake_history <0x-prefixed staking provider address>
```

## Run Hardhat tests

```bash
npx hardhat test
```

## Deploy

To deploy to the Goerli test network you will need a `.env` that looks similar to:

```
GOERLI_RPC_URL="https://goerli.infura.io/v3/bd76xxxxxxxxxxxxxxxxxxxxxxxxxff0"
GOERLI_PRIVATE_KEY="3d3ad2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx87b"
ETHERSCAN_TOKEN="M5xxxxxxxxxxxxxxxxxxxxxxxxxxxxxSMV"
```

You can then run

```bash
npx hardhat --network goerli deploy
```

The contract will be deployed and the source code will be verified on etherscan.

## Test Deployment

In order to run a test deployment:

```bash
npx hardhat --network mainnet_test deploy
```

This will use the deployment script in `deploy-test`.
The difference is that it also deploys a mock Token contract, which makes testing on mainnet possible.
