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


const info = {
	'username' 	: 'mstr3336',
	'server'	: 'hpc.sydney.edu.au'
}

const cmds = {
	'query_all' : 'fetch_jobs_json.sh'
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

	previousState['jobList'] = data;

	return previousState;
}

export const updateState = (event, previousState) => {
		
		switch(event.type) {
			case 'JOBS_FETCHED' : return updateJoblist(event.output, previousState);
			default : return previousState;
		}
}

const headers = {
	'job_id': {
		text: 'Job Id'
	},
	'Job_Name': {
		text: 'Job Name'
	},
	'job_state': {
		text: 'Job State'
	},
	'resources_used.mem': {
		text: 'Memory Used',
	},
	'resources_used.walltime': {
		text: 'Time used'
	}
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
					  {job.resources_used.mem}
					  <br></br>
					  {job.Resource_List.mem}
					</td>
					<td>
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
  width: 400,
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 5,
  padding: 15,
  fontSize: 11,
  fontFamily: 'Helvetica'
}