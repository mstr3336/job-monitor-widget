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
	'query_all' : 'fetch_jobs_json.sh'
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

	previousState['jobList'] = data;

	return previousState;
}

export const updateState = (event, previousState) => {
		console.debug(event);
		switch(event.type) {
			case 'JOBLIST_FETCHED' : return updateJoblist(event.output, previousState);
			//case 'JOB_STATUS_FETCHED' : return updateJobStatus(event.output, previousState);
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