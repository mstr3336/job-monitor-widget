# job-monitor-widget


Extract job_ids from `qstat -wu $USER`:


```bash
sed -re '1,/[-\s]+$/ d;s/ .*//' $(qstat -wu $USER)
```

