// The Graph protocol limits GraphQL queries to a max number of 1000 results
const gqlResultsPerQuery = 1000

// Contracts addresses
const tokenStakingAddress = "0x409bf77A8E3Fe384497227eA508029B5364933DE"
const tokenStakingProxyAddress = "0x01B67b1194C75264d06F808A921228a95C765dd7"
const walletRegistryAddress = "0x46d52E41C2F300BC82217Ce22b920c34995204eb"
const randomBeaconAddress = "0x5499f54b4A1CB4816eefCf78962040461be3D80b"

module.exports = {
  gqlResultsPerQuery,
  tokenStakingAddress,
  tokenStakingProxyAddress,
  walletRegistryAddress,
  randomBeaconAddress,
}
