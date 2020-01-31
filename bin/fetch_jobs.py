# Use python 3.7.2

import re, json, subprocess, sys

def get_job_list(username):
	cmd = ["qselect", "-u", username]
	px = subprocess.run(
			cmd,
			capture_output = True,
			text = True
		)

	job_ids = px.stdout
	if job_ids:
		job_ids = job_ids.split()
	else:
		job_ids = []
	
	return job_ids

def get_listed_jobs_raw(job_ids):
	if not job_ids: return ""

	cmd = ["qstat", "-ft"] + job_ids
	px = subprocess.run(
			cmd, 
			capture_output = True,
			text = True)
	
	raw_output = px.stdout
	return raw_output

def split_raw_jobs(raw_job_stats):
	pat = re.compile(r"Job Id:")
	
	out = pat.split(raw_job_stats)
	
	for i, job in enumerate(out):
		out[i] = "job_id = " + job

	return out

def job_to_dict(raw_job):
	out = {}
	
	sublists = ["Resource_List", "resources_used"]

	key_pat = r"(?P<key>Job_Name|job_state|array.*|job_id)"
	val_pat = r"(?P<val>.*)"
	pat = re.compile(r"^\s*" + key_pat + r"\s*=\s*" + val_pat + "$", flags = re.MULTILINE)
	
	matches = pat.findall(raw_job)
	#print(matches)

	for match in matches:
		#print(match)
		k = match[0]
		v = match[1]

		out[k] = v
	
	for sublist in sublists:
		out[sublist] = get_sublist(raw_job, sublist)

	return out

def get_sublist(raw_job, sublist_name, useful_keys=("mem","walltime")):
	out = {}
	useful_keys = list(useful_keys)

	list_pat = r"(?P<sublist>" + sublist_name + r")"
	
	key_pat = r"(?P<key>" + "|".join(useful_keys) + r")"	
	val_pat = r"(?P<val>.*)"
	pat = re.compile(r"^\s*" + list_pat + r"\." + key_pat + r"\s*=\s*" + val_pat + "$", 
			flags = re.MULTILINE)
	
	matches = pat.finditer(raw_job)
	
	for m in matches:
		#print(m)
		out[m.group("key")] = m.group("val")
	
	return out

def get_all_job_stats(user):
	job_ids = get_job_list(user)
	jobs = get_listed_jobs_raw(job_ids)
	jobs = split_raw_jobs(jobs)

	for i, job in enumerate(jobs):
		jobs[i] = job_to_dict(job)
	
	jobs = [job for job in jobs if job and job["job_id"]]

	return jobs

if __name__ == "__main__":
	user = sys.argv[1]

	jobs = get_all_job_stats(user)
	print(json.dumps(jobs))


