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
  small_font: "7px"
}


export const refreshFrequency = 1000*30;


export const command = (dispatch) => {
	run('ssh ' + info.username + '@' + info.server + ' ' + cmds.query_all)
		.then((output) => dispatch({ type: 'JOBS_FETCHED', output}));

}

export const inititalState = { 
	jobList : []
};

function updateJoblist(result, previousState) {
	let data = JSON.parse(result);
	//console.debug(result);

	console.debug({
		msg: "Job List Fetched",
		dttm: new Date(), 
		payload: data});

	previousState['jobList'] = data.map((job, i) => {
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
	});

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
		"whiteSpace": "nowrap",
		"overflowX" : "hidden",
		"overflowY" : "hidden",
		"fontSize"  : "11px",
		"width" : "21px"
	}
}

const MemoryBar = (level) => {
	const container_style = {
		display : "grid",
		"gridTemplateRows" : `${100-level}% auto`,
		"width" : "21px",
		"height": "12px",
		"outlineStyle": "solid",
		"outlineColor": className.color,
		"outlineWidth": "thin"
	}

	const bar_style = getMemoryStyle(level);
	const top_bar_style = {
		"whiteSpace": "nowrap",
		"overflowX" : "hidden",
		"overflowY" : "hidden",
		"fontSize"  : "11px",
		"width" : "21px"
	}


	return(
		<div style={container_style}>
			<div style={top_bar_style}>{level}%</div>
			<div style={bar_style}>{level}%</div>
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

const MemoryBarCell = styled("div")((props) => ({
	width: "80px"
}))


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
			{state.jobList.map((job, i) => {
				return(
					<tr key={i}>
					<td><IDCell>{job.Job_Name}</IDCell></td>
					<td><IDCell>{job.job_id}</IDCell></td>
					<td>{bytes.format(job.Resource_List.mem, {decimalPlaces:0}).replace("B","")}</td>
					<td>{bytes.format(job.resources_used.mem, {decimalPlaces:0}).replace("B","")}</td>
					<td><MemoryBarCell>{MemoryBar(job.pct.mem)}</MemoryBarCell></td>
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