# Threshold Network tBTCv2 Requirements Monitoring

`requirements.sh` is a script that can be run at any time to check that your node meets rewards requirements for the given month.

It is intended to be used for monitoring, specifically for monitoring your node's uptime requirement
so that you can alert on decreases in uptime that may be sending you on a path to not meeting the uptime requirement.

## Installation

### Node/Yarn
Ensure that you have a fairly recent version of node and yarn.
#### Recommended: Node Version Manager
Install and use [Node Version Manager](https://github.com/nvm-sh/nvm) to obtain your node and yarn dependencies by following the instructions at https://github.com/nvm-sh/nvm#installing-and-updating.
- After installing nvm, create/edit `.nvm/default-packages` and add `yarn` so that you'll get yarn installed.
- `nvm install --lts` will install the LTS node/yarn for you

### JQ
`apt install jq`

### Clone repo and install packages
- Clone this repo
- Change directory to the local repo clone root and run `npm install`

## Usage

**Scripts should be run from `src/scripts/tbtcv2-rewards` directory**

### First-time: Obtain Etherscan key
You'll need an Etherscan API key to run the scripts.  You can get one at https://info.etherscan.com/api-keys/

### First-time: Obtain operator address
The scripts use your operator address instead of your staking provider address, so you'll need to obtain your operator address using `staker2operator.sh`:

> `./staker2operator.sh --etherscan-token <etherscan token> --staker-address <staking provider address>`

### Running Requirements Script
> `./requirements.sh --etherscan-token <etherscan token> --operator-address <operator address> --output <filename>`

This is the primary script to use to check if your node is meeting requirements.  It will write the result to the output file, looking something like this:
```
[
    {
        "requiredUptimePercent": "96",
        "startTimestamp": 1696118400,
        "endTimestamp": 1697225528,
        "startBlock": 18251965,
        "endBlock": 18343577
    },
    {
        "0x<Staking Provider Address>": {
            "applications": {
                "beaconAuthorization": "1116333908567923503741751",
                "tbtcAuthorization": "1116334357430223004995679"
            },
            "instances": {
                "foo.bar.eu:9601": {
                    "upTimePercent": 99.67409409358775,
                    "avgPreParams": 1000,
                    "version": {
                        "v2.0.0-m5": 1697225520
                    }
                }
            },
            "requirements": {
                "isBeaconAuthorized": true,
                "isTbtcAuthorized": true,
                "isUptimeSatisfied": true,
                "isPreParamsSatisfied": true,
                "isVersionSatisfied": true
            }
        }
    }
]
```

You can run this script on an interval and feed it into your monitoring/alerting system.

## Questions/Comments
@shoegazer in the #stakers channel of the Threshold discord server

