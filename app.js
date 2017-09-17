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
const RemoteState = require('./components/remote-state');
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
	const outs = new Outs(require('./data/outs.json'));

	const max_id_lenth = _.max(_.map(outs.outs, (out, id) => {
		return id.length;
	}));

	console.log('Outs\n - ' + _.map(outs.outs, (out, id) => {
		return out.pin.id + '\t' + _.padEnd(id, max_id_lenth) + '\t' + out.label;
	}).join('\n - '));

	/*	Reset
	-------------------------------------*/
		_.each(outs.outs, (out) => {
			out.deactivate();
		});


	/*	Write initial files
	------------------------------------------*/
		/* _.each(outs.outs, (out, id) => {
			fs.writeFileSync(`./php/data/${id}.json`, JSON.stringify({
				is_active: false,
				label: out.label
			}, null, 4));
		}); */


/*	Remove State
------------------------------------------*/
	const remote_state = new RemoteState('http://iamjoshhansen.com/home-automation-control-kernel/db/', 1000);

	remote_state.on('change', (id, is_active) => {
		console.log('remote change: `' + id + '` to `' + is_active + '`');
		outs.get(id).set(is_active);
	});

	// remote_state.on('fetch-duration', (duration) => {
	// 	console.log(`fetch duration: ${duration}`);
	// });


/*	Set up notifications for all switches
------------------------------------------*/
	// outs.on('change', (id, is_on) => {
	// 	let label = outs.get(id).label;
	// 	let state = is_on ? 'On' : 'Off';
	// 	ping(`${state}: ${label}`);
	// });



/*	Repeating Event
------------------------------------------*/
	// const repeating_event = new RepeatingEvent({
	// 	start: new Date().getTime() + 3000,
	// 	duration: '1s',
	// 	frequency: '10s',
	// });

	// repeating_event.on('change', (state) => {
	// 	console.log(`repeating event change: ${state}`);
	// });


const backyard_sequence = '15m:sprinkler_back_near 5s 15m:sprinkler_back_far';
const backyard_frequency = '1d';

const sequences = [
		{
			label: 'Back Yard (morning)',
			start: '2017-09-19 5:00 AM',
			frequency: backyard_frequency,
			sequence: backyard_sequence,
		},
		{
			label: 'Back Yard (lunch)',
			start: '2017-09-19 11:00 AM',
			frequency: backyard_frequency,
			sequence: backyard_sequence,
		},
		{
			label: 'Back Yard (evening)',
			start: '2017-09-19 4:00 PM',
			frequency: backyard_frequency,
			sequence: backyard_sequence,
		},
		{
			label: 'Front Yard',
			start: '2017-09-18 5:00 AM',
			frequency: '3d',
			sequence: '15m:sprinkler_front_near 5s 15m:sprinkler_front_far'
		},
		{
			label: 'Front Drip',
			start: '2017-09-17 6:00 AM',
			frequency: '1d',
			sequence: '10m:drip_front'
		}
	];


function bindSequenceToOuts (sequence) {
	sequence.on('activate', () => {
		ping(`Sequence: ${sequence.label}`);
	});

	if (sequence.state) {
		outs.get(sequence.state).set(true);
	}

	sequence.on('change', (state, old_state) => {
		if (old_state) {
			outs.get(old_state).set(false);
		}

		if (state) {
			outs.get(state).set(true);
		}
	});

	sequence.activate();
}


_.each(sequences, (sequence) => {
	bindSequenceToOuts(new RepeatingSequence(sequence));
});


/*	Repeating Sequence
------------------------------------------*/
	// const repeating_sequence = new RepeatingSequence({
	// 	start: new Date(new Date().getTime() + duration('10s')),
	// 	frequency: '1d',
	// 	sequence: '10s:sprinkler_back_near 5s 10s:sprinkler_back_far',
	// });

	// console.log(`repeating_sequence initial state: ${repeating_sequence.state}`);
	// if (repeating_sequence.state) {
	// 	outs.get(repeating_sequence.state).set(true);
	// }

	// repeating_sequence.on('change', (state, old_state) => {
	// 	console.log(`repeating_sequence: ${old_state} -> ${state}`);
	// 	if (old_state) {
	// 		outs.get(old_state).set(false);
	// 	}

	// 	if (state) {
	// 		outs.get(state).set(true);
	// 	}
	// });


/*
	let duration = require('./components/duration.js');

	outs.get('sprinkler_front_near').activate();

	setTimeout(() => {
		outs.get('sprinkler_front_near').deactivate();
	}, duration('9m55s'));

	setTimeout(() => {
		outs.get('sprinkler_front_far').activate();
	}, duration('10m'));

	setTimeout(() => {
		outs.get('sprinkler_front_far').deactivate();
	}, duration('19m55s'));

	setTimeout(() => {
		outs.get('drip_front').activate();
	}, duration('20m'));

	setTimeout(() => {
		outs.get('drip_front').deactivate();
	}, duration('30m'));
*/





console.log('[ EOF ]');
