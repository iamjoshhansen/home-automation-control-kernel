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

	Deferred    = require('./components/deferred.js');


var now = new Date();
console.log(dateString(now));

console.log('\n\n\n');



/*	Evs
------------------------------------------*/
	// let evs = {};

	// _.each(require('./data/events.json'), (ev_json, id) => {
	// 	evs[id] = new Ev[ev_json.type](ev_json);
	// });



let outs = new Outs(require('./data/outs.json'));

let max_id_lenth = _.max(_.map(outs.outs, (out, id) => {
	return id.length;
}));

console.log('Outs\n - ' + _.map(outs.outs, (out, id) => {
	return out.pin.id + '\t' + _.padEnd(id, max_id_lenth) + '\t' + out.label;
}).join('\n - '));


_.each(outs.outs, (out) => {
	out.deactivate();
});


setTimeout(() => {
	setInterval(() => {
		outs.get('led_lamp').toggle();
	}, 3000);
}, 0);

setTimeout(() => {
	setInterval(() => {
		outs.get('salt_lamp').toggle();
	}, 3000);
}, 1000);

setTimeout(() => {
	setInterval(() => {
		outs.get('fountain').toggle();
	}, 3000);
}, 2000);



console.log('[ EOF ]');
