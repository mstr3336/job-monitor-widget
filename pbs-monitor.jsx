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

export const refreshFrequency = 60000;


export const command = (dispatch) => {
	let joblist = run('ssh ' + info.username + '@' + info.server + ' ' + cmds.query_all);
	
	dispatch({ type: 'JOBLIST_FETCHED', data : joblist});
	
		

}

export const inititalState = { output : 'fetching jobs' };

export const updateState = (event, previousState) => {
		print(event);
}

export const render = ({ state }) => {
	return(
		<div>
			<h1> Hello </h1>

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