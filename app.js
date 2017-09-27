'use strict';

const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const Ev = require('./components/evs/ev');
const PinOutput = require('./components/pin-output');
const Outs = require('./components/outs');
const dateString = require('./components/date-string');
const Metrics = require('./components/metrics');
const Deferred = require('./components/deferred');
const ManualInput = require('./components/manual-input');
const ActualState = require('./components/actual-state');
const DB = require('./components/db');
const RepeatingEvent = require('./components/evs/repeating-ev');
const RepeatingSequence = require('./components/evs/repeating-sequence');
const duration = require('./components/duration');

const metrics = new Metrics('http://iamjoshhansen.com/coffee-house/index.php');
const ping = require('./components/messenger.js');

console.log(`



88  88  dP"Yb  8b    d8 888888        db    88   88 888888  dP"Yb  8b    d8    db    888888 88  dP"Yb  88b 88      dP""b8  dP"Yb  88b 88 888888 88""Yb  dP"Yb  88         88  dP 888888 88""Yb 88b 88 888888 88
88  88 dP   Yb 88b  d88 88__         dPYb   88   88   88   dP   Yb 88b  d88   dPYb     88   88 dP   Yb 88Yb88     dP   '" dP   Yb 88Yb88   88   88__dP dP   Yb 88         88odP  88__   88__dP 88Yb88 88__   88
888888 Yb   dP 88YbdP88 88""        dP__Yb  Y8   8P   88   Yb   dP 88YbdP88  dP__Yb    88   88 Yb   dP 88 Y88     Yb      Yb   dP 88 Y88   88   88"Yb  Yb   dP 88  .o     88"Yb  88""   88"Yb  88 Y88 88""   88  .o
88  88  YbodP  88 YY 88 888888     dP""""Yb 'YbodP'   88    YbodP  88 YY 88 dP""""Yb   88   88  YbodP  88  Y8      YboodP  YbodP  88  Y8   88   88  Yb  YbodP  88ood8     88  Yb 888888 88  Yb 88  Y8 888888 88ood8


Version 2.0
`);


var now = new Date();
console.log(dateString(now));

console.log('\n\n\n');


/*	Evs
------------------------------------------*/
	// let evs = {};

	// _.each(require('./data/events.json'), (ev_json, id) => {
	// 	evs[id] = new Ev[ev_json.type](ev_json);
	// });



/*	Declare Outs
------------------------------------------*/
	const db = new DB('http://iamjoshhansen.com/home-automation-control-kernel/db2', 'pins');
	// const db = new DB('http://localhost:8888/iamjoshhansen/home-automation-control-kernel/db2', 'pins');
	const outs = new Outs();

	db.fetch()
		.then((response) => {
			_.each(response.data, (out, id) => {
				outs.createOut(id, out);
			});

			declareOuts();
			resetOuts();
			bindReasons();
			runSchedule();
		})
		.catch((er) => {
			console.log('Fetch for pins failed.');
			console.log(`${db.endpoint}/?table=${db.table}`);
			console.log(er);
		});


	function declareOuts () {
		const max_id_lenth = _.max(_.map(outs.outs, (out, id) => {
			return id.length;
		}));

		console.log('Outs\n - ' + _.map(outs.outs, (out, id) => {
			return out.pin.id + '\t' + _.padEnd(id, max_id_lenth) + '\t' + out.label;
		}).join('\n - '));
	}


	function resetOuts () {
		console.log('Reseting outs');
		_.each(outs.outs, (out) => {
			out.deactivate();
		});
	}


	function bindReasons () {
		console.log('Binding Reasons');

		setInterval(() => {
			db.fetch()
				.then((response) => {
					_.each(response.data, (pin_data, id) => {
						const out = outs.get(id);
						const reason = 'manual';

						if (pin_data.manual_on) {
							out.addReason(reason);
						} else {
							out.removeReason(reason);
						}
					});
				});
		}, 1000);
	}



/*	Bind out change to reported state in DB
------------------------------------------*/
	outs
		// .on('change-reasons', (id, reasons) => {
		// 	console.log(`outs noticed a change in reasons for ${id}: ${reasons.join(', ')}`);
		// 	db.set(id, {
		// 		reasons_to_be_on: reasons
		// 	});
		// })
		.on('add-reason', (id, reason) => {
			console.log(`outs noticed a new reason for ${id} to be on: "${reason}"`);
			db.addToGroup(id, 'reasons_to_be_on', reason);
		})
		.on('remove-reason', (id, reason) => {
			console.log(`outs noticed a removed reason for ${id} to be on: "${reason}"`);
			db.removeFromGroup(id, 'reasons_to_be_on', reason);
		});



/*	Set up notifications for all switches
------------------------------------------*/
	// outs.on('change', (id, is_on) => {
	// 	let label = outs.get(id).label;
	// 	let state = is_on ? 'On' : 'Off';
	// 	ping(`${state}: ${label}`);
	// });

function runSchedule () {
	console.log('Running Schedule');

	const backyard_sequence = '15m:sprinkler_back_near 5s 15m:sprinkler_back_far';

	const sequences = [
			{
				label: 'The Yard',
				start: '2017-09-19 5:00 AM',
				frequency: '3d',
				sequence: `${backyard_sequence} 5s 15m:sprinkler_front_near 5s 15m:sprinkler_front_far`,
			},
			{
				label: 'Front Drip',
				start: '2017-09-17 6:00 AM',
				frequency: '1d',
				sequence: '10m:drip_front'
			},
			{
				label: 'Back Yard',
				start: '2017-09-19 9:00 AM',
				frequency: '2d',
				sequence: backyard_sequence,
			},
			{
				label: 'Front Lights',
				start: '2017-09-27 7:00 PM',
				frequency: '1d',
				sequence: '12h:front_path_lights'
			},
			{
				label: 'Game Cabinet',
				start: '2017-09-27 6:00 PM',
				frequency: '1d',
				sequence: '3h:game_cabinet'
			},
			{
				label: 'Blinky',
				start: '2017-09-27 4:00 PM',
				frequency: '2m',
				sequence: '1m:green_led',
			},
		];


	function bindSequenceToOuts (sequence) {
		// sequence.on('activate', () => {
		// 	ping(`Sequence: ${sequence.label}`);
		// });

		if (sequence.state) {
			outs.get(sequence.state).set(true);
		}

		sequence.on('change', (state, old_state) => {
			const reason = `sequence: ${sequence.label}`;

			if (old_state) {
				const out = outs.get(old_state);
				console.log(`\n\nremoving reason from ${old_state}: "${reason}"`);
				out.removeReason(reason);
			}

			if (state) {
				const out = outs.get(state);
				console.log(`\n\nadding reason to ${state}: "${reason}"`);
				out.addReason(reason);
			}
		});

		sequence.activate();
	}


	_.each(sequences, (sequence) => {
		bindSequenceToOuts(new RepeatingSequence(sequence));
	});
}




console.log('[ EOF ]');
