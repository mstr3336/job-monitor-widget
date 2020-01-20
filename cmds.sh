#!/bin/bash

module load jq

# Intended to run serverside
function get_job_ids() {
    # Remove Everything before a line of only --- and whitespace
    # Then remove everything after the first word for each line

    # jq json-ifies the output


	sed -Ee '1,/[-\s]+$/ d;s/ .*//' $(qstat -wu $USER) |& \
	  jq -nR '[inputs | select(length>0)]' 

}