#!/bin/bash

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd $scriptDir 

username="$USER"

if [ ! -z "$1" ]; then
	username="$1"
fi

echo "$username"

module load python/3.7.2

python fetch_jobs.py "$username"
