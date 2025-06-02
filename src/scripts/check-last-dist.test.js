// Check if the TACo rewards calculated on the last distribution present in the
// distributions folder are correct.

const { expect } = require("chai")
const fs = require("fs")
const { BigNumber } = require("bignumber.js")
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

// This is a list of real stakes and their TACo authorization, chosen for their
// minimal history of authorization change events.
// In these tests, it is assumed that the TACo authorization for these is not
// going to change, so the rewards calculated by the `gen_rewards_dist.js`
// script is checked against the expected rewards of these stakes during the
// rewards' period.
// Nothing prevents these authorizations from changing in the future, so if the
// correspoding test fails, it is possible that some of these may need to be
// removed from the list or updated with the new expected rewards.
const KNOWN_STAKES = {
  "0x0154C52ec5b6a3010758dDe78079589E67526767": "40000000000000000000000",
  "0x227Ae73b95F8377e4E37A8bc7aE7DdFF303C30B4": "950000000000000000000000",
  "0x2B1D879B5e102e60166202de79537B48E2F18a42": "40000000000000000000000",
  "0x2dE8481F08e5c2fe88c653A64AE42CA00B20E98D": "3080540000000000000000000",
  "0x3070f20f86fDa706Ac380F5060D256028a46eC29": "100711858306284501543914",
  "0x36efDC29c776c35B55D08E657bF3048eDf65b1dD": "358211799966041790230847",
  "0xfD771E3e34A93E19CAaD4C11c3Be16c70d5ec2Fd": "8878008876380566232312730",
  "0x700277dEaf138c6af9B3177F83918B6a3544F27F": "2937281291740508368290891",
  // "0xE8316911b0F9EdD928d58B63fF619888077aD713": "26477821174325506468806",
  "0xE58dfD1bC7f3Ca2b694bDFDc1C6cac80179A7515": "250000000000000000000000",
  "0xd6Fc4e95E0622DdedAD3289dF7873d8136645E8d": "11396394422715831517269628",
}

const BETA_STAKERS = [
  "0x43df8c68a56249CC151dfb3a7E82cC7Fd624cF2a",
  "0x885fA88126955D5CFE0170A134e0300B8d3EfF47",
  "0x9Aa35dCE841A43693Cde23B86c394E1aEFb61c65",
  "0x331F6346C4c1bdb4Ef7467056C66250F0Eb8A44f",
  "0xc54238cac19bB8D57a9Bcdd28C3fdd49d82378D8",
  "0xBf40548b6Fd104C3cA9B2F6b2E2383301dB1c023",
  "0xedd0C77314f07fCA414B549156A0d9C915B096E9",
  "0x621074D613Fc938bD9381AB77Ef3609a02432628",
  "0xB0C9F472b2066691Ab7FEE5b6702c28ab35888b2",
  "0xBDC3D611B79349e0b3d63833619875E89388298D",
  "0xc9909E3d0B87A1A2eB0f1194Ec5e3694464Ac522",
  "0x8afC0e9F8207975301893452bDeD1e8F2892f953",
  "0x58d665406Cf0F890daD766389DF879E84cc55671",
  "0x39A2D252769363D070a77fE3ad24b9954e1fB876",
  "0xE6C074228932F53C9E50928AD69DB760649A8C4d",
  "0xF2962794EbE69fc88F8dB441c1CD13b9F90B1Fe7",
  "0x557C836714aFd04f796686b0a50528714B549C74",
  "0x16fCc54E027a342F0683263eb43Cd9af1BD72169",
  "0xCC957f683a7e3093388946d03193Eee10086b900",
  "0xEAE5790C6eE3b6425f39D3Fd33644a7cb90C75A5",
  "0x02faA4286eF91247f8D09F36618D4694717F76bB",
  "0xBa1Ac67539c09AdDe63335635869c86f8e463514",
  "0xa6E3A08FaE33898fC31C4f6C7a584827D809352D",
  "0xDC09db6e5DA859eDeb7FC7bDCf47545056dC35F7",
  "0xdA08C16C86B78cD56CB10FDc0370EFc549d8638B",
  "0xC0B851DCBf00bA59D8B1f490aF93dEC4275cFFcC",
  "0x372626FF774573E82eb7D4545EE96F68F75aaFF6",
  "0xB88A62417eb9e6320AF7620BE0CFBE2dddd435A5",
  "0xb78F9EFE4F713feEFcAB466d2ee41972a0E45205",
  "0x97d065B567cc4543D20dffaa7009f9aDe64d7E26",
  "0xc1268db05E7bD38BD85b2C3Fef80F8968a2c933A",
  "0xAAFc71044C2B832dDDFcedb0AE99695B0367dC57",
  "0x6dEE1fd2b29e2214a4f9aB9Ba5f3D17C8Cb56D11",
  "0x5838636dCDd92113998FEcbcDeDf5B0d8bEB4920",
  "0xa7baCa5A92842689359Fb1782e75D6eFF59152e6",
]

describe("Checking last TACo rewards distribution", () => {
  const distFolders = fs.readdirSync("./distributions/")
  // The last element is `distribution.json`, so we need the second last
  const lastDistFolder = distFolders[distFolders.length - 2]
  const prevDistFolder = distFolders[distFolders.length - 3]

  console.log("Checking last TACo rewards distribution:", lastDistFolder)

  describe("Checking calculations of the last distribution", () => {
    it("should include the necessary files", () => {
      const merkleFiles = fs.readdirSync(`./distributions/${lastDistFolder}`)
      expect(merkleFiles).include("MerkleInputBonusRewards.json")
      expect(merkleFiles).include("MerkleInputTbtcv2Rewards.json")
      expect(merkleFiles).include("MerkleInputTACoRewards.json")
      expect(merkleFiles).include("MerkleInputTotalRewards.json")
      expect(merkleFiles).include("MerkleDist.json")

      const detailsFiles = fs.readdirSync(
        `./distributions/${lastDistFolder}/TACoRewardsDetails`
      )
      expect(detailsFiles).include("EarnedRewards.json")
      expect(detailsFiles).include("HeartbeatRituals.json")
      expect(detailsFiles).include("NodesFailures.json")
      expect(detailsFiles).include("PotentialRewards.json")
    })

    it("should bonus rewards be the same as the last dist", () => {
      const lastDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/MerkleInputBonusRewards.json`
        )
      )
      const prevDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${prevDistFolder}/MerkleInputBonusRewards.json`
        )
      )
      expect(lastDist).to.deep.equal(prevDist)
    })

    it("should tBTCv2 rewards be the same as the last dist", () => {
      const lastDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/MerkleInputTbtcv2Rewards.json`
        )
      )
      const prevDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${prevDistFolder}/MerkleInputTbtcv2Rewards.json`
        )
      )
      expect(lastDist).to.deep.equal(prevDist)
    })

    it("should MerkleDist.totalAmount be correctly calculated", () => {
      const lastMerkleDist = JSON.parse(
        fs.readFileSync(`./distributions/${lastDistFolder}/MerkleDist.json`)
      )
      const calculatedTotalRewards = Object.keys(lastMerkleDist.claims).reduce(
        (acc, key) => acc.plus(BigNumber(lastMerkleDist.claims[key].amount)),
        BigNumber(0)
      )

      const jsonTotalRewards = BigNumber(lastMerkleDist.totalAmount)

      expect(jsonTotalRewards.eq(calculatedTotalRewards)).to.be.true
    })

    it("should the sum in MerkleInputTACoRewards be greater than prev month", () => {
      const lastDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/MerkleInputTACoRewards.json`
        )
      )
      const prevDist = JSON.parse(
        fs.readFileSync(
          `./distributions/${prevDistFolder}/MerkleInputTACoRewards.json`
        )
      )

      const lastTotalRewards = Object.keys(lastDist).reduce(
        (acc, key) => acc.plus(BigNumber(lastDist[key].amount)),
        BigNumber(0)
      )

      const prevTotalRewards = Object.keys(prevDist).reduce(
        (acc, key) => acc.plus(BigNumber(prevDist[key].amount)),
        BigNumber(0)
      )

      expect(lastTotalRewards.gt(prevTotalRewards)).to.be.true
    })

    it("should distributions.json contains the correct numbers", () => {
      const lastMerkleDist = JSON.parse(
        fs.readFileSync(`./distributions/${lastDistFolder}/MerkleDist.json`)
      )
      const distributions = JSON.parse(
        fs.readFileSync("./distributions/distributions.json")
      )

      const merkleDistAmount = BigNumber(lastMerkleDist.totalAmount)
      const cumulativeByDate = BigNumber(
        distributions.CumulativeAmountByDistribution[lastDistFolder]
      )
      const latestCumulative = BigNumber(distributions.LatestCumulativeAmount)

      expect(merkleDistAmount.eq(cumulativeByDate)).to.be.true
      expect(merkleDistAmount.eq(latestCumulative)).to.be.true
    })

    it("should match last MerkleDist total with previous plus earned", () => {
      const prevMerkleDist = JSON.parse(
        fs.readFileSync(`./distributions/${prevDistFolder}/MerkleDist.json`)
      )

      const lastMerkleDist = JSON.parse(
        fs.readFileSync(`./distributions/${lastDistFolder}/MerkleDist.json`)
      )

      const earnedRewards = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/TACoRewardsDetails/EarnedRewards.json`
        )
      )

      const totalInPrevMerkleDist = Object.keys(prevMerkleDist.claims).reduce(
        (acc, key) => acc.plus(BigNumber(prevMerkleDist.claims[key].amount)),
        BigNumber(0)
      )

      const totalInLastMerkleDist = Object.keys(lastMerkleDist.claims).reduce(
        (acc, key) => acc.plus(BigNumber(lastMerkleDist.claims[key].amount)),
        BigNumber(0)
      )

      const totalEarnedRewards = Object.keys(earnedRewards).reduce(
        (acc, key) => acc.plus(BigNumber(earnedRewards[key].amount)),
        BigNumber(0)
      )

      expect(
        totalInPrevMerkleDist.plus(totalEarnedRewards).eq(totalInLastMerkleDist)
      ).to.be.true
    })

    it("should the Merkle proof verification pass for all the stakes", () => {
      function verifyProof(wallet, beneficiary, amount, proof, root) {
        amount = BigNumber(amount)
        const tree = new MerkleTree([], keccak256, { sortPairs: true })
        const element =
          wallet + beneficiary.substr(2) + amount.toString(16).padStart(64, "0")
        const node = MerkleTree.bufferToHex(keccak256(element))
        return tree.verify(proof, node, root)
      }

      const lastMerkleDist = JSON.parse(
        fs.readFileSync(`./distributions/${lastDistFolder}/MerkleDist.json`)
      )

      const merkleRoot = lastMerkleDist.merkleRoot
      const claims = lastMerkleDist.claims

      Object.keys(claims).map((stProv) => {
        const beneficiary = claims[stProv].beneficiary
        const amount = claims[stProv].amount
        const proof = claims[stProv].proof
        const proofResult = verifyProof(
          stProv,
          beneficiary,
          amount,
          proof,
          merkleRoot
        )
        const error = `Error verifying proof for ${stProv}.`
        expect(proofResult, error).to.be.true
      })
    })
  })

  describe("Checking known stakes", () => {
    const lastDist = JSON.parse(
      fs.readFileSync(
        `./distributions/${lastDistFolder}/MerkleInputTACoRewards.json`
      )
    )
    const prevDist = JSON.parse(
      fs.readFileSync(
        `./distributions/${prevDistFolder}/MerkleInputTACoRewards.json`
      )
    )

    it("should known stakes receive expected rewards", () => {
      Object.keys(KNOWN_STAKES).map((stProv) => {
        const lastDistAmount = BigNumber(lastDist[stProv].amount)
        const prevDistAmount = BigNumber(prevDist[stProv].amount)
        const earnedAmount = lastDistAmount.minus(prevDistAmount)

        const startDate = new Date(prevDistFolder)
        const endDate = new Date(lastDistFolder)
        const periodDuration = (endDate.getTime() - startDate.getTime()) / 1000

        const expectedEarnedAmount = BigNumber(KNOWN_STAKES[stProv])
          .times(0.15)
          .times(0.25)
          .times(periodDuration)
          .div(31536000)

        const error =
          `Unexpected amount of rewards for ${stProv}. ` +
          "Maybe the stake has changed its TACo auth?"

        expect(earnedAmount.toFixed(0)).to.equal(
          expectedEarnedAmount.toFixed(0),
          error
        )
      })
    })

    it("should beta stakers not receive rewards", () => {
      let lastDistAcc = BigNumber(0)
      let prevDistAcc = BigNumber(0)

      BETA_STAKERS.map((stProv) => {
        if (lastDist[stProv]) {
          lastDistAcc = lastDistAcc.plus(BigNumber(lastDist[stProv].amount))
        }
        if (prevDist[stProv]) {
          prevDistAcc = prevDistAcc.plus(BigNumber(prevDist[stProv].amount))
        }
      })

      expect(lastDistAcc.minus(prevDistAcc).eq(0)).to.be.true
    })
  })

  describe("Checking penalizations", () => {
    it("should infractors be penalized", () => {
      const potentialRewards = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/TACoRewardsDetails/PotentialRewards.json`
        )
      )

      const earnedRewards = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/TACoRewardsDetails/EarnedRewards.json`
        )
      )

      const nodesFailures = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/TACoRewardsDetails/NodesFailures.json`
        )
      )

      Object.keys(earnedRewards).map((stProv) => {
        const potentialAmount = BigNumber(potentialRewards[stProv].amount)
        const earnedAmount = BigNumber(earnedRewards[stProv].amount).toFixed(0)

        const failures = nodesFailures[stProv]
          ? nodesFailures[stProv].length
          : 0

        let expectedAmount = potentialAmount.toFixed(0)
        if (failures >= 4) {
          expectedAmount = "0"
        } else if (failures === 3) {
          expectedAmount = potentialAmount.times(1).div(3).toFixed(0)
        } else if (failures === 2) {
          expectedAmount = potentialAmount.times(2).div(3).toFixed(0)
        }

        const error = `Error calculating ${stProv} penalty`
        expect(earnedAmount).to.equal(expectedAmount, error)
      })
    })
  })

  describe("Checking 15M T cap for eligible stake", () => {
    it("should rewards for any stake not exceed the corresponding to 15M", () => {
      const earnedRewards = JSON.parse(
        fs.readFileSync(
          `./distributions/${lastDistFolder}/TACoRewardsDetails/EarnedRewards.json`
        )
      )

      const startDate = new Date(prevDistFolder)
      const endDate = new Date(lastDistFolder)
      const periodDuration = (endDate.getTime() - startDate.getTime()) / 1000

      const maxAmount = BigNumber(15000000 * 10 ** 18)
        .times(0.15)
        .times(0.25)
        .times(periodDuration)
        .div(31536000)
        .decimalPlaces(0)

      Object.keys(earnedRewards).map((stProv) => {
        const earnedAmount = BigNumber(earnedRewards[stProv].amount)
        expect(
          maxAmount.gte(earnedAmount),
          `${stProv} earned more rewards than allowed by 15M T cap`
        ).to.be.true
      })
    })
  })
})
