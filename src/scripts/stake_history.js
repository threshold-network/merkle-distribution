// Script that retrieves the history of a list of stakes since a specific block
// the data will be uploaded to a Github gist.
// It is necessary to have the following env variables in .env file:

// Use:
// node stake_history.js [<st. prov. address> <timestamp>]
// If no address as argument, list below will be taken (legacy stakers)
// If no timestamp as argument, 1700625971 (legacy stakers disabled) will be taken
// Both argument, or neither, must be supplied

require("dotenv").config()
const { Octokit } = require("@octokit/core")
const schedule = require("node-schedule")
const Subgraph = require("./pre-rewards/subgraph.js")

const graphqlApi =
  "https://api.studio.thegraph.com/query/24143/main-threshold-subgraph/0.0.7"
const gistId = "198e3fe2f9d4b5f0442b6354ff8ffa8b"

// Time in which legacy stakers were disabled
// https://etherscan.io/tx/0x68ddee6b5651d5348a40555b0079b5066d05a63196e3832323afafae0095a656
const defaultTime = "2023-11-22T04:06:11.000Z"
const defaultTimestamp = new Date(defaultTime).getTime() / 1000

// Legacy stakers list
const defaultStakes = [
  "0x01474098607ed064f72832e1491b2261967166da",
  "0x04670e07912b3764cc1ccf1c22ad0f35b95e9ba0",
  "0x06eb8d86cbc1693079d2ff0fa9cb55a26cd07f15",
  "0x07c9a8f8264221906b7b8958951ce4753d39628b",
  "0x0ace6419dbdab7f9330568258b9ddb37a295b677",
  "0x229beeaa51590c3abbc628af55283b73ed2dbf9d",
  "0x25d9bbb4eccbf3a5e6d6bbce9813302e508f321d",
  "0x33769235a2980730ae7e17fc6eaf4740530cde1b",
  "0x378c89b5b93667a005856822e1b65e2d7c076373",
  "0x1147ccfb4aefc6e587a23b78724ef20ec6e474d4",
  "0x456d643cd97b058fd3bbbeb76f04b1de3679bc6a",
  "0x650a9ed18df873cad98c88dcac8170531cad2399",
  "0x4d3c343d4bd676e4098336ef75f1d717149623a1",
  "0xd977144724bc77faefae219f958ae3947205d0b5",
  "0x56c968857ef4919c67d151b56e7073065994c97a",
  "0xcbb734bba70c6462a9f22c2b481346ebef3cfad3",
  "0x700277deaf138c6af9b3177f83918b6a3544f27f",
  "0x2ebe08379f4fd866e871a9b9e1d5c695154c6a9f",
  "0x8cc46611bec3217d058d92fd234a8ed7d205e0d2",
  "0x83237ba2b7d0bf23090196fccbfb2be1ef21580d",
  "0x855a75f56706d7be02e2d20b74a0725abbdc453e",
  "0x4bfa10b1538e8e765e995688d8eec39c717b6797",
  "0x8868240903e44c7cb8bc5a5158f3de10707644e9",
  "0x8d0b183b68cc93b9f9e1490c85b4a4965ef5cd3b",
  "0x8d34285c047d5d8757551baa45e471e62e72f468",
  "0x9919c9f5cbbaa42cb3bea153e14e16f85fea5b5d",
  "0x3b9e5ae72d068448bb96786989c0d86fbc0551d1",
  "0xa2e44666bab3ed3be4f87b7c18ed2ffb911c0bef",
  "0xa6a2ae15f74f1e3f574f419a8853f0c9b095bc48",
  "0xa829c2e33907ab03d27d5dbb39effd8386112789",
  "0xb70c8d55d397aa5d76f96c64b3e4084db95c739e",
  "0xa4166c3e14cbdd6d4494945a99616f1c73ad9699",
  "0xaea619d02dcf7299fb24db2f60a08bfc8fb2dbcf",
  "0xca70fea021359778daec479b97d0cd2efe1ad099",
  "0xdcd4199e22d09248ca2583cbdd2759b2acd22381",
  "0xfc97a906c715587b56c2c65a07ce731ba80339de",
  "0xc82bed104c3d5785fecebf906e5b1747a1bce681",
  "0xcd087a44ed8ee2ace79f497c803005ff79a64a94",
  "0xce4407df6ae8a92eb69412bd6a8ec49a9b9b40dd",
  "0xd0908b1e0f6e64e3097c663bf95e2e9c040dd40d",
  "0xd680b01503cf95a489010da7409980060991d096",
  "0xd6edf0bc0c19f87ecef67632bfcd212ce8324ab9",
  "0x341154298ab7ca86278df9665fb2b8610b92214d",
  "0xe26e2d93bbc8fde0e1e3b290fc927fb374e7e34e",
  "0xa5f6822ef1a7df72628259f9d1dc17eb2bcb2385",
  "0x045e511f53debf55c9c0b4522f14f602f7c7ca81",
  "0xf9283ac13aec8a2b60a56a82f1f5e4da1742ccf8",
  "0xfd771e3e34a93e19caad4c11c3be16c70d5ec2fd",
]

async function main() {
  const args = process.argv.slice(2)
  const stakes = args[0] ? [args[0]] : defaultStakes
  const timestamp = args[1] ? args[1] : defaultTimestamp

  const stakeHistoryList = {}

  console.log(new Date().toString(), ": Getting the staking history...")
  console.time()

  for (let i = 0; i < stakes.length; i++) {
    const stakingHistory = await Subgraph.getStakingHistory(
      graphqlApi,
      timestamp,
      stakes[i]
    )

    stakeHistoryList[stakes[i]] = stakingHistory
  }

  console.log("Retrieving the staking history took: ")
  console.timeEnd()

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })

  await octokit.request("PATCH /gists/{gist_id}", {
    gist_id: gistId,
    description: `Last update: ${new Date()}`,
    files: {
      "legacy_stakers_monitoring.json": {
        content: JSON.stringify(stakeHistoryList, null, 2),
      },
    },
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
}

console.log("Start job scheduling")

// Run the script every hour
schedule.scheduleJob("0 */1 * * *", main)
