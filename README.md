# job-monitor-widget


Extract job_ids from `qstat -wu $USER`:


```bash
sed -re '1,/[-\s]+$/ d;s/ .*//' $(qstat -wu $USER)
```

Parse these into json (Requires jq loaded on server, consider loading with module load jq if avail)

```bash
sed -re '1,/[-\s]+$/ d;s/ .*//' tests/qstat_wu.output |& jq -nR '[inputs | select(length>0)]' 

```

```bash
[
  "3963231[].pbsserver",
  "3963232.pbsserver",
  "3963253[].pbsserver",
  "3963254.pbsserver",
  "3984779[].pbsserver",
  "3984780.pbsserver",
  "3984813[].pbsserver",
  "3984814.pbsserver",
  "3984889[].pbsserver",
  "3984890.pbsserver",
  "3985089[].pbsserver",
  "3985090.pbsserver",
  "3988465.pbsserver"
]

```


Getting values from a single `qstat -f job_id` call:

```bash
cat tests/qstat_f_batch_id_elem.out |& \
  jq -R 'match("(?<list_type>Resource_List)\\.(?<resource_type>\\S*)\\s*=\\s*(?<resource_val>.*)", "ig")'

```



```bash

cat tests/qstat_f_batch_id_elem.out |& jq -R 'match("(?<list_type>Resource_List|resources_used)\\.(?<resource_type>\\S*)\\s*=\\s*(?<resource_val>.*)", "ig") |\
 {(.captures | .[] | select(.name == "list_type").string) : \
   {(.captures | .[] | select(.name == "resource_type").string) : \
       .captures | .[] | select(.name == "resource_val").string}}' 

```
