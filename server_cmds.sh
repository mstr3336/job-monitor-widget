#!/bin/bash

# module load python/3.7.2

# Intended to run serverside
function get_job_ids() {
    # Remove Everything before a line of only --- and whitespace
    # Then remove everything after the first word for each line

    # jq json-ifies the output

	echo "$(qstat -wu $USER)" |& \
		sed -Ee '1,/[-\s]+$/ d;s/ .*//' 
	 	 
}

function get_all_jobs_raw() {
	local job_ids=$(get_job_ids)

	qstat -ft ${job_ids}
}

