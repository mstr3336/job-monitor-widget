# PBS Job Monitor Widget

This widget allows you to monitor the status of HPC jobs submitted on PBS 
systems from your desktop, at a glance, without having to fiddle with `qstat`,
and reading through full job displays to understand what's happening. 

![Full Size Screenshot](screenshot_full.png)

__This has been tested on PBS Pro 13 only.__

In order to make it compatible with other PBS Releases (Including those that
natively support job outputs in JSON formatting), the server-side commands may
need to be adapted to ensure that the output matches the API expected by the client.

It is possible that the `qstat -f` API has remained stable since PBSPro 13, but
I can't say for sure.

Additionally, the environment modules provided by your HPC system may vary, and 
the server-side scripts expect python >= 3.7 in order to function correctly. 

## Installation

Installation takes two steps for this widget, the first is to install the server-side commands (Found in `./bin`). 

The other step is to install the contents of `PBSJobMonitor.widget.zip` to