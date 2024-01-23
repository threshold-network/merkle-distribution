#!/bin/bash
set -eou pipefail

LOG_START='\n\e[1;36m'           # new line + bold + color
LOG_END='\n\e[0m'                # new line + reset color
DONE_START='\n\e[1;32m'          # new line + bold + green
DONE_END='\n\n\e[0m'             # new line + reset
LOG_WARNING_START='\n\e\033[33m' # new line + bold + warning color
LOG_WARNING_END='\n\e\033[0m'    # new line + reset

NETWORK_DEFAULT="mainnet"

help() {
  echo -e "\nUsage: $0" \
    "--etherscan-token <etherscan-token>" \
    "--staker-address <staker-address>"
  echo -e "\nRequired command line arguments:\n"
  echo -e "\t--etherscan-token: Etherscan API key token"
  echo -e "\t--staker-address: Staker address to report on." 
  echo -e "\nOptional command line arguments:\n"
  echo -e "\t--network: Network name. Default: ${NETWORK_DEFAULT}"
  exit 1 # Exit script after printing help
}

# Transform long options to short ones
for arg in "$@"; do
  shift
  case "$arg" in
  "--etherscan-token") set -- "$@" "-t" ;;
  "--staker-address") set -- "$@" "-x" ;;
  "--network") set -- "$@" "-n" ;;
  "--help") set -- "$@" "-h" ;;
  *) set -- "$@" "$arg" ;;
  esac
done

# Parse short options
OPTIND=1
while getopts "t:x:n:h" opt; do
  case "$opt" in
  t) etherscan_token="$OPTARG" ;;
  x) staker_address="$OPTARG" ;;
  n) network="$OPTARG" ;;
  h) help ;;
  ?) help ;; # Print help in case parameter is non-existent
  esac
done
shift $(expr $OPTIND - 1) # remove options from positional parameters

NETWORK=${network:-${NETWORK_DEFAULT}}
ETHERSCAN_TOKEN=${etherscan_token:-""}
STAKER_ADDRESS=${staker_address:-""}

if [ "$STAKER_ADDRESS" == "" ]; then
  printf "${LOG_WARNING_START}Staker address must be provided.${LOG_WARNING_END}"
  help
fi

if [ "$ETHERSCAN_TOKEN" == "" ]; then
  printf "${LOG_WARNING_START}Etherscan API key token must be provided.${LOG_WARNING_END}"
  help
fi

printf "${LOG_START}Installing yarn dependencies...${LOG_END}"
yarn install

ETHERSCAN_TOKEN=${ETHERSCAN_TOKEN} yarn staker2operator \
  --staker-address ${STAKER_ADDRESS} \
  --network ${NETWORK}

printf "${DONE_START}Complete!${DONE_END}"
