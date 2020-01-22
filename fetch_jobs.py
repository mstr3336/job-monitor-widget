# Use python 2

import re, json, subprocess

def get_raw_jobs():
	cmd = "get_all_jobs_raw"
	raw_output = subprocess.check_output(cmd)

	print raw_output
	return raw_output


get_raw_jobs()
