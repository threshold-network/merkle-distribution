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
receive rewards. The cutoff day for a new version is calculated by adding three
weeks to its tag creation date, which can be verified by executing the command
`git show <tag>`.

Note: There is an exception for the month of February, where a cutoff day to
upgrade a client from `v2.0.0-m1` to `v2.0.0-m2` is until February 27th.

Here are a few examples to demonstrate the build version requirement.

```
E.g. 1
                          v1                v1 or v2
         ---------------------------------\|-------|
Timeline -|--------------------------------*-------|->
        May1                             May25   May31
                                          v2
Where:
Rewards interval: May 1 - May 31
v2 is released on May 25
delay = 14 days
v2 + delay = May24 + 14 days = June 8
Between May 1 - May 25 a client runs on v1
Between May 25 - May 31 a client is allowed to run on v1 or v2

E.g. 2
                 v1 or v2                    v2
         --/------------------\|---------------------------|
Timeline -*--------|-----------*---------------------------|->
        May25    June1       June8                      June30
          v2               (v2+delay)
Where:
Rewards interval: June 1 - June 30
v2 is released on May 25
delay = 14 days
v2 + delay = May 25 + 14 days = June 8
Between June 1 - June 8 a client is allowed to run v1 or v2
Between June 8 - June 30 a client is allowed to run only v2
```
