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


function get_job_info() {
	local job_id=$1
	local raw_output="$(qstat -f $job_id)"
         
	#echo "$raw_output"
	local useful_keys="Resource_List|resources_used|Job_Name|job_state|array"

	local filtered_output=$(echo "$raw_output" |& grep -iE "$useful_keys")
	echo "$filtered_output"

	local resource_list=$(echo "$raw_output" |& sed -eE '/Resource_List/p')
}

function make_json_dict() {
        local input=$1; if [ "$input" == "-" ]; then read input; fi
        
	echo "$input" |& \
	  sed -Ee 's/^(.+)\s+=\s*(.+)/"\1":"\2",/g;
	           1s;^;{\n;
		   $s/,$/\n}\n/'

}


function get_sublist() {
        local string=$1; if [ "$string" == "-" ]; then read string; fi
        local prefix="$2"
	
	echo "$string" |& \
	  sed -nEe '/$prefix/p' |& \
	  sed -Ee  's/^.*\.//'  |& \
	  make_json_dict

}
