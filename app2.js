'use strict';

console.log(`



88  88  dP"Yb  8b    d8 888888        db    88   88 888888  dP"Yb  8b    d8    db    888888 88  dP"Yb  88b 88      dP""b8  dP"Yb  88b 88 888888 88""Yb  dP"Yb  88         88  dP 888888 88""Yb 88b 88 888888 88
88  88 dP   Yb 88b  d88 88__         dPYb   88   88   88   dP   Yb 88b  d88   dPYb     88   88 dP   Yb 88Yb88     dP   '" dP   Yb 88Yb88   88   88__dP dP   Yb 88         88odP  88__   88__dP 88Yb88 88__   88
888888 Yb   dP 88YbdP88 88""        dP__Yb  Y8   8P   88   Yb   dP 88YbdP88  dP__Yb    88   88 Yb   dP 88 Y88     Yb      Yb   dP 88 Y88   88   88"Yb  Yb   dP 88  .o     88"Yb  88""   88"Yb  88 Y88 88""   88  .o
88  88  YbodP  88 YY 88 888888     dP""""Yb 'YbodP'   88    YbodP  88 YY 88 dP""""Yb   88   88  YbodP  88  Y8      YboodP  YbodP  88  Y8   88   88  Yb  YbodP  88ood8     88  Yb 888888 88  Yb 88  Y8 888888 88ood8


Version 2.0
`);



var axios = require('axios'),
	_     = require('lodash'),
	fs    = require('fs'),

	Ev        = require('./components/evs/ev.js'),

	PinOutput = require('./components/pin-output.js'),
	Outs      = require('./components/outs.js'),

	dateString = require('./components/date-string.js'),

	Metrics = require('./components/metrics.js'),
	metrics = new Metrics('http://iamjoshhansen.com/coffee-house/index.php'),

	Deferred    = require('./components/deferred.js'),

	RemoteState = require('./components/remote-state.js');


var now = new Date();
console.log(dateString(now));

console.log('\n\n\n');


function ping (msg) {
	console.log('PING: ', msg);
	return axios.post('https://maker.ifttt.com/trigger/reminder/with/key/f3HqyRey51BeJWWjrq4I-AP9hy_IosZZ3IZfDR5lGya', {
			value1: msg
		});
}


/*	Evs
------------------------------------------*/
	// let evs = {};

	// _.each(require('./data/events.json'), (ev_json, id) => {
	// 	evs[id] = new Ev[ev_json.type](ev_json);
	// });



/*	Declare Outs
------------------------------------------*/
	let outs = new Outs(require('./data/outs.json'));

	let max_id_lenth = _.max(_.map(outs.outs, (out, id) => {
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
	let remote_state = new RemoteState('http://iamjoshhansen.com/home-automation-control-kernel/db/', 1000);

	remote_state.on('change', (id, is_active) => {
		console.log('remote change: `' + id + '` to `' + is_active + '`');
		outs.get(id).set(is_active);
	});


outs.on('change', (id, is_on) => {
	let label = outs.get(id).label;
	let state = is_on ? 'On' : 'Off';
	ping(`${state}: ${label}`);
});


let duration = require('./components/duration.js');


/* outs.get('sprinkler_front_near').activate();

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
}, duration('30m')); */





console.log('[ EOF ]');
