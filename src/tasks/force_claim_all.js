/* eslint-disable no-useless-escape */
/* eslint-disable quotes */

// Script to force the claim of remaining rewards for all stakes
// Use: npx hardhat force-claim-all
// if no network is specified, it will use a forked mainnet
// A .env file with the following parameters is required:
// ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<API_KEY>
// FORKING_URL=https://eth-mainnet.g.alchemy.com/v2/DFKBoAU6bctp0iM53kt9gwncbJCcS7ae

const { task } = require("hardhat/config")
const fs = require("fs")
const { BigNumber } = require("bignumber.js")

task(
  "force-claim-all",
  "Force the claim of the remaining staking rewards for all stakes",
  async function (taskArguments, hre) {
    const LAST_DIST = "./distributions/2025-09-01/MerkleDist.json"
    const MERKLE_DIST_ADDRESS = "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37"
    const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL

    const { ethers } = hre

    // Get the unclaimed amounts for every stake
    const merkleDistDeployment = fs.readFileSync(
      "deployments/mainnet/CumulativeMerkleDrop.json"
    )
    const merkleDistAbi = JSON.parse(merkleDistDeployment).abi

    const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL)
    const [claimer] = await ethers.getSigners()

    const contract = new ethers.Contract(
      MERKLE_DIST_ADDRESS,
      merkleDistAbi,
      provider
    )

    const dist = JSON.parse(fs.readFileSync(LAST_DIST))
    const claims = dist.claims

    const unclaimed_stakes = []

    for (const address of Object.keys(claims)) {
      const distributed = BigNumber(claims[address].amount)
      const claimed = BigNumber(
        (await contract.cumulativeClaimed(address)).toString()
      )
      const unclaimed = distributed.minus(claimed)

      if (unclaimed.gt(0)) {
        unclaimed_stakes.push({
          stProvider: address,
          beneficiary: claims[address].beneficiary,
          distributed: distributed,
          claimed: claimed,
          unclaimed: unclaimed,
          proof: claims[address].proof,
        })
      }
    }

    // Dump the unclaimed amounts to a file
    const unclaimed_stakes_json = JSON.stringify(
      unclaimed_stakes.map((stake) => {
        return {
          stProvider: stake.stProvider,
          beneficiary: stake.beneficiary,
          distributed: stake.distributed.toFixed(0),
          claimed: stake.claimed.toFixed(0),
          unclaimed: stake.unclaimed.toFixed(0),
          proof: stake.proof,
        }
      }),
      null,
      2
    )
    fs.writeFileSync("unclaimed_rewards_report.json", unclaimed_stakes_json)

    // Print some stats
    const totalDistributed = BigNumber(dist.totalAmount)
    const totalUnclaimed = unclaimed_stakes.reduce((acc, stake) => {
      return acc.plus(stake.unclaimed)
    }, BigNumber(0))

    console.log(
      "Total amount of rewards distributed:",
      totalDistributed.toFixed(),
      "= ~",
      totalDistributed.div(1e18).toFormat(0)
    )
    console.log(
      "Total amount of rewards unclaimed:",
      totalUnclaimed.toFixed(),
      "= ~",
      totalUnclaimed.div(1e18).toFormat(0)
    )
    console.log("Number of claims to be done:", unclaimed_stakes.length)

    // Check Merkle root in the contract matches the last distribution
    try {
      const merkleRootContract = await contract.merkleRoot()
      if (merkleRootContract !== dist.merkleRoot) {
        console.error(
          "Contract Merkle root and last distribution doesn't match"
        )
        return
      }
    } catch (error) {
      console.error(`${error}`)
      return
    }

    // Build the claim transaction
    const batchClaim = []
    unclaimed_stakes.map((unclaimed_stake) => {
      const claim = {}
      claim["stakingProvider"] = unclaimed_stake.stProvider
      claim["beneficiary"] = unclaimed_stake.beneficiary
      claim["amount"] = unclaimed_stake.distributed.toFixed(0)
      claim["proof"] = unclaimed_stake.proof
      batchClaim.push(claim)
    })

    try {
      const txReport = {}
      const tx = await contract
        .connect(claimer)
        .batchClaim(dist.merkleRoot, batchClaim)
      const txReceipt = await tx.wait()

      txReport["claimer"] = txReceipt.from
      txReport["txHash"] = txReceipt.transactionHash
      txReport[
        "txURL"
      ] = `https://etherscan.io/tx/${txReceipt.transactionHash}/`
      txReport["gasUsed"] = txReceipt.gasUsed.toString()
      txReport["txData"] = tx.data

      fs.writeFileSync(
        "force_claim_all_tx_report.json",
        JSON.stringify(txReport, null, 2)
      )
    } catch (error) {
      console.error("Error claiming the rewards:")
      console.error(error.reason || error)
      return
    }

    console.log("✅ All claimed!")

    // Build the batch transaction to be executed by SAFE multisig
    const batch_transaction = JSON.parse(
      fs.readFileSync("src/tasks/force_claim_batch_transaction_template.json")
    )

    const unclaimed_rewards_report = JSON.parse(
      fs.readFileSync("unclaimed_rewards_report.json")
    )

    let txClaims = "["

    for (const stake of unclaimed_rewards_report) {
      txClaims = txClaims.concat(
        '["' +
          stake.stProvider +
          '","' +
          stake.beneficiary +
          '","' +
          stake.distributed +
          '",[' +
          stake.proof.map((p) => '"' + p + '"').join(",") +
          "]],"
      )
    }
    txClaims = txClaims.slice(0, -1).concat("]")
    batch_transaction.transactions[0].contractInputsValues.Claims = txClaims

    fs.writeFileSync(
      "force_claim_all_batch_transaction.json",
      JSON.stringify(batch_transaction, null, 2)
    )
  }
)
