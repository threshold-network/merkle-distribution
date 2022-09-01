# T Merkle Distributor

Solidity contract for Threshold rewards' distribution.

In Cumulative Merkle Drop contract each new token distribution replaces previous one and should
contain cumulative balances of all the participants. Cumulative claimed amount is used as
invalidation for every participant.

## Structure

This is a Hardhat project:

- `contracts`: Source code for contract
- `test`: Contract tests
- `scripts`: Hardhat scripts:
  - `gen_merkle_dist.js`: generate new Merkle distribution
  - `verify_proof.js`: verify Merkle proof
  - `stake_history.js`: fetch the information of a particular staker, including staking history.
  - `claim_example.js`: example about how to claim tokens using the contract

## Examples

- `example_stake_list_<n>.json`: List of stakes and its data. This JSON is the input of
  `gen_merkle_dist.js`, which will return the Merkle Distribution for provided stakes.
- `example_dist_generated_<n>.json`: All the data of the generated Merkle distribution. Includes the
  total amount of tokens to be claimed by stakers, the Merkle root, and the info of each stake. It's
  the output of `gen_merkle_dist.js`.
- `example_proof_generated_<n>.json`: This is an example of the data that will be provided to each
  staker. Includes the Merkle root, the amount of tokens to be claimed and the Merkle proof. It's the
  output of `gen_merkle_dist.js`.

## Installation

```bash
npm install
```

## Run scripts

```bash
npx hardhat run scripts/<script.js>
```

## Run tests

```bash
npx hardhat test
```

## Deploy

To deploy to the Ropsten test network you will need a `.env` that looks similar to:

```
ROPSTEN_RPC_URL="https://ropsten.infura.io/v3/bd76xxxxxxxxxxxxxxxxxxxxxxxxxff0"
ROPSTEN_PRIVATE_KEY="3d3ad2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx87b"
MAINNET_ETHERSCAN_KEY="M5xxxxxxxxxxxxxxxxxxxxxxxxxxxxxSMV"
```

You can then run

```bash
npx hardhat --network ropsten deploy
```

The contract will be deployed and the source code will be verified on etherscan.

## Test Deployment

In order to run a test deployment:

```bash
npx hardhat --network mainnet_test deploy
```

This will use the deployment script in `deploy-test`.
The difference is that it also deploys a mock Token contract, which makes testing on mainnet possible.
