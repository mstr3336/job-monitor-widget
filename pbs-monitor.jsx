/* global fetch */
/**
 * BEGIN HEADER
 *
 * Contains:        pbs-job-monitor Widget for <http://tracesof.net/uebersicht/>
 * Maintainer:      Matthew Strasiotto
 * License:         GNU GPL v3
 *
 * Description:     This file contains the code for the pbs-job-monitor Widget for the
 *                  macOS software Übersicht.
 *
 * END HEADER
 */

/**
 * Import the CSS function to render CSS styles.
 * @type {Function}
 */
import { css , run, React, styled } from 'uebersicht'
//import DataTable from 'react-data-table-component';
//import SmartDataTable from 'react-smart-data-table'
//var bytes = require('./node_modules/bytes');
import bytes from 'bytes'

const info = {
	'username' 	: 'mstr3336',
	'server'	: 'hpc.sydney.edu.au'
}

const cmds = {
	'query_all' : 'fetch_jobs_json.sh'
}

const theme = {
  green: '#97c475',
  green_threshold: 80,
  yellow: '#e5c07b',
  yellow_threshold: 55,
  orange: '#d09a6a',
  orange_threshold: 30,
  red: '#e06c75',
  small_font: "7px",
  subjob_info_font: "8px",
  mem_bar_width: "13px"
}


export const refreshFrequency = 1000*30;


export const command = (dispatch) => {
	run('ssh ' + info.username + '@' + info.server + ' ' + cmds.query_all)
		.then((output) => dispatch({ type: 'JOBS_FETCHED', output}));

}

export const inititalState = { 
	jobList : [],
	jobDict : {}
};

function processJob(job, index) {
		['resources_used', 'Resource_List']
		  .forEach(str => {
		  	const epoch = '1970-01-01T';

		  	if (job[str] == undefined) job[str] = {};

		  	if (job[str].mem == undefined) job[str].mem = "0kb";
		  	
		  	job[str].mem = bytes.parse(job[str].mem);
		  	
		  	if (job[str].walltime == undefined) job[str].walltime = "00:00:00";

	
			job[str].time = new Date(epoch + job[str].walltime + 'Z');
			job[str].walltime = job[str].walltime.slice(0, job[str].walltime.lastIndexOf(":"));
			
		});

		job.pct = {};

		['mem', 'time'].forEach((str => {
			job.pct[str] = Math.round(100*job.resources_used[str] / job.Resource_List[str]);
		}));


		return job;
	}

function buildJobDict(jobList) {
	var out = {};

	// Matches 1234[5] but not 12345 or 1234[]
	const scalar_pat = RegExp('\\d+\\[\\\d+\]');

	// Only matches if brackets have a number
	const subjob_pat = RegExp('(?<number>\\d+)\\[(?<array_index>\\d+)\\](?<suffix>.*)');



	// Matches number inside brackets
	//const idx_strip  = RegExp('(?<=\[)' + '\d+' + '(?=\])');



	jobList.forEach((job) => {
		if (!scalar_pat.test(job.job_id)) {
			out[job.job_id] = job;
			out[job.job_id].subjobs = {};
		}
	});

	jobList.forEach((job) => {
		var idx = "0";

		if (out.hasOwnProperty(job.job_id)) {
			job.array_index = idx;
			out[job.job_id].subjobs[idx] = job;
			return;
		}

		var matches = job.job_id.match(subjob_pat);
		if (matches == undefined) return;

		var key = matches.groups.number + "[]" + matches.groups.suffix;
		idx = matches.groups.array_index;

		if (!job.hasOwnProperty("array_index")) job.array_index = idx;

		if (out.hasOwnProperty(key)) {
			out[key].subjobs[idx] = job;
		}

	});
	return out;
}

function updateJoblist(result, previousState) {
	let data = JSON.parse(result);
	//console.debug(result);

	console.debug({
		msg: "Job List Fetched",
		dttm: new Date(), 
		payload: data});

	previousState['jobList'] = data.map(processJob)

	previousState['jobDict'] = buildJobDict(previousState['jobList']);

	return previousState;
}

export const updateState = (event, previousState) => {
		
		switch(event.type) {
			case 'JOBS_FETCHED' : return updateJoblist(event.output, previousState);
			default : return previousState;
		}
}

const getMemoryColor = (level) => {
	if (level < theme.green_threshold) return theme.green;
	if (level < theme.yellow_threshold) return theme.yellow;
	if (level < theme.orange_threshold) return theme.orange;
	return theme.red;
}

const getMemoryStyle = (level) => {
	const color = getMemoryColor(level);
	
	return {
		background: color,
		"width" : theme.mem_bar_width
	}
}

const MemoryBar = (level, key) => {
	const container_style = {
		display : "grid",
		"gridTemplateRows" : `${100-level}% auto`,
		"width" : theme.mem_bar_width,
		"height": "12px",
		"outlineStyle": "solid",
		"outlineColor": className.color,
		"outlineWidth": "thin"
	}

	const bar_style = getMemoryStyle(level);
	const top_bar_style = {
		"width" : theme.mem_bar_width
	}

	const infobox_style = {
		display: "grid",
		gridTemplateColumns: "8px 0px auto"
	}


	return(
		<div key={key} style={infobox_style}>
			<div style={{fontSize: theme.subjob_info_font}}>{key}</div>
		    <div style={{textAlign: "left", whiteSpace: "nowrap", zIndex: 1, fontSize:"10px"}}>
		    {level}
		    </div>
			<div style={container_style}>
				<div style={top_bar_style}></div>
				<div style={bar_style}></div>
			</div>
		</div>
		)
}


const getTimeStyle = (level) => {
	const color = getMemoryColor(level);
	return {
		background : color,
		"textAlign": "left",
		"whiteSpace": "nowrap"
	}
}

const TimeBar = (level) => {
	const container_style = {
		display: "grid",
		"gridTemplateColumns": `${level}% auto`,
		"outlineStyle": "solid",
		"outlineColor": className.color,
		"outlineWidth": "thin"
	}
	const bar_style = getTimeStyle(level);

	return(
		<div style={container_style}>
			<div style={bar_style}>{level}%</div>
			<div></div>
		</div>
		)
}

const IDCell = styled("div")((props) => ({
	width: "30px", 
	height: "15px",
	overflowY: "hidden",
	"wordWrap": "break-word",
	fontSize: theme.small_font//"0.3vw"
}))

const TopCell = styled("div")((props) => ({
	display: "grid"
}))

const MemoryBarCell = styled("div")((props) => ({
	width: "80px",
	display: "grid",
	gridTemplateColumns: "auto auto auto auto auto",
	gridGap: "5px",
	justifyContent: "flex-start"
}))

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export const renderSubjobMemory = ( job ) => {
	return(
		<MemoryBarCell>
			{Object.keys(job.subjobs).map((key, i) => {
				const idx = job.subjobs[key].array_index;
				return(MemoryBar(job.subjobs[key].pct.mem, idx));
			})}
		</MemoryBarCell>
		)
}


export const render = ( state ) => {
	console.debug({
		msg: "Rendering state",
		dttm: new Date(),
		payload: state
	});


	return(
		<div>
		<h1>PBS Jobs</h1>
		<p style={{fontSize: "80%"}}>Last refreshed {new Date().toString()}</p>
		<table>
			<colgroup>
			  <col></col>
			  <col></col>
			  <col span="3"></col>
			  <col span="3"></col>
			</colgroup>
			<thead>
			  <tr>
			  	<th scope="col">Name</th>
			  	<th scope="col">ID</th>
			  	<th colSpan="3" scope="colgroup">Memory</th>
			  	<th colSpan="3" scope="colgroup">Time</th>
			  </tr>
			  <tr>
			  	<th scope="col"></th>
			  	<th scope="col"></th>
			  	<th scope="col">Reqd</th>
			  	<th scope="col">Used</th>
			  	<th scope="col">%</th>
			  	<th scope="col">Reqd</th>
			  	<th scope="col">Used</th>
			  	<th scope="col">%</th>
			  </tr>
			</thead>
			<tbody>
			{Object.keys(state.jobDict).map((key, i) => {
				var job = state.jobDict[key];
				return(
					<tr key={i} style={{borderBottom: "1px solid white"}}>
					<td><TopCell><IDCell>{job.Job_Name}</IDCell></TopCell></td>
					<td><IDCell>{job.job_id}</IDCell></td>
					<td>{bytes.format(job.Resource_List.mem, {decimalPlaces:0}).replace("B","")}</td>
					<td>{bytes.format(job.resources_used.mem, {decimalPlaces:0}).replace("B","")}</td>
					<td>{renderSubjobMemory(job)}</td>
					<td>{job.Resource_List.walltime}</td>
					<td>{job.resources_used.walltime}</td>
					<td>{TimeBar(job.pct.time)}</td>
					</tr>
					)})}
			</tbody>

		</table>
		</div>
		//
		)
}


export const className = {
  top: 20,
  left: 10,
  width: 300,
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 5,
  padding: 5,
  fontSize: 11,
  fontFamily: 'Helvetica'
}