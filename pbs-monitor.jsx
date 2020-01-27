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
import { css , run, React } from 'uebersicht'
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
  red: '#e06c75'
}


export const refreshFrequency = 1000*10;


export const command = (dispatch) => {
	run('ssh ' + info.username + '@' + info.server + ' ' + cmds.query_all)
		.then((output) => dispatch({ type: 'JOBS_FETCHED', output}));

}

export const inititalState = { 
	jobList : []
};

function updateJoblist(result, previousState) {
	let data = JSON.parse(result);

	previousState['jobList'] = data.map((job, i) => {
		['resources_used', 'Resource_List']
		  .forEach(str => {
		  	const epoch = '1970-01-01T';

			job[str].mem = bytes.parse(job[str].mem);
			job[str].mem /= 1024*1024;
			job[str].mem = Math.round(job[str].mem);

			job[str].time = new Date(epoch + job[str].walltime + 'Z');
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
		"white-space": "nowrap",
		"overflow-x" : "hidden",
		"overflow-y" : "hidden",
		"font-size"  : "8px",
		"width" : "12px"
	}
}

const MemoryBar = (level) => {
	const container_style = {
		display : "grid",
		"grid-template-rows" : `${100-level}% auto`,
		"width" : "12px",
		"height": "12px",
		"outline-style": "solid",
		"outline-color": className.color,
		"outline-width": "thin"
	}

	const bar_style = getMemoryStyle(level);


	return(
		<div style={container_style}>
			<div></div>
			<div style={bar_style}>{level}%</div>
		</div>
		)
}


const getTimeStyle = (level) => {
	const color = getMemoryColor(level);
	return {
		background : color,
		"text-align": "left",
		"white-space": "nowrap"
	}
}

const TimeBar = (level) => {
	const container_style = {
		display: "grid",
		"grid-template-columns": `${level}% auto`,
		"outline-style": "solid",
		"outline-color": className.color,
		"outline-width": "thin"
	}
	const bar_style = getTimeStyle(level);

	return(
		<div style={container_style}>
			<div style={bar_style}>{level}%</div>
			<div></div>
		</div>
		)
}

export const render = ( state ) => {
	console.warn( state );
	return(
		<div>
		<h1>PBS Jobs</h1>
		<table>
			<thead>
			  <tr>
			  <td>Name</td>
			  <td>Id</td>
			  <td>Memory</td>
			  <td>Time</td>
			  </tr>
			</thead>
			<tbody>
			{state.jobList.map((job, i) => {
				return(
					<tr key={i}>
					<td>{job.Job_Name}</td>
					<td>{job.job_id}</td>
					<td>
					  <div>
					   <div> </div>
					   <div style={getMemoryStyle(job.pct.mem)}></div>
					  </div>
					  {job.resources_used.mem}
					  <br></br>
					  {job.Resource_List.mem}
					</td>
					<td>
						{TimeBar(job.pct.time)}
						{job.resources_used.walltime}
						<br></br>
						{job.Resource_List.walltime}
					</td>
					</tr>
					)})}
			</tbody>

		</table>

		</div>
		//
		)
}


export const className = {
  top: 10,
  left: 10,
  width: 220,
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 5,
  padding: 15,
  fontSize: 11,
  fontFamily: 'Helvetica'
}