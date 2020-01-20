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
import { css , run } from 'uebersicht'

const info = {
	'username' 	: 'mstr3336',
	'server'	: 'hpc.sydney.edu.au'
}

const cmds = {
	'query_all' : 'get_job_ids',
	'job_info'  : 'get_job_info'
}


export const refreshFrequency = 1000*30;


export const command = (dispatch) => {
	run('ssh ' + info.username + '@' + info.server + ' ' + cmds.query_all)
		.then((output) => dispatch({ type: 'JOBLIST_FETCHED', output}));

}

export const inititalState = { 
	jobList : [], 
	jobStatuses : {}
};

function updateJoblist(result, previousState) {
	let data = JSON.parse(result);

	previousState['jobList'] = data;

	for (let job of data ) {
		console.info("Fetching data for " + job);
		var job_status = run('ssh ' + info.username + '@' + info.server + ' ' + cmds.job_info + ' ' + job);

		
		job_status
			.then((status) => {console.warn(status)});
			//.then((status) => updateState({type : 'JOB_STATUS_FETCHED', output : { job_id : job, status }}), previousState);

		console.info(job_status);

	}

	return previousState;
}

function updateJobStatus(result, previousState) {
	result.status = JSON.parse(result.status);
	console.warn(result);

	previousState.jobStatuses[result.job_id] = result.status;
	return previousState;
}

export const updateState = (event, previousState) => {
		console.warn(event);
		switch(event.type) {
			case 'JOBLIST_FETCHED' : return updateJoblist(event.output, previousState);
			case 'JOB_STATUS_FETCHED' : return updateJobStatus(event.output, previousState);
			default : return previousState;
		}
}

export const render = ( state ) => {
	console.debug( state );
	return(
		<div>
			<h1> {state.jobList} </h1>

		</div>
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