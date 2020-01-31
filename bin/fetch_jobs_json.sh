#!/bin/bash

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd $scriptDir 

username="$USER"

if [ ! -z "$1" ] && username="$1"


module load python/3.7.2

python fetch_jobs.py $username
