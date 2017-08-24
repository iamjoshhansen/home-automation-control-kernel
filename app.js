'use strict';

console.log(`



88  88  dP"Yb  8b    d8 888888        db    88   88 888888  dP"Yb  8b    d8    db    888888 88  dP"Yb  88b 88      dP""b8  dP"Yb  88b 88 888888 88""Yb  dP"Yb  88         88  dP 888888 88""Yb 88b 88 888888 88
88  88 dP   Yb 88b  d88 88__         dPYb   88   88   88   dP   Yb 88b  d88   dPYb     88   88 dP   Yb 88Yb88     dP   '" dP   Yb 88Yb88   88   88__dP dP   Yb 88         88odP  88__   88__dP 88Yb88 88__   88
888888 Yb   dP 88YbdP88 88""        dP__Yb  Y8   8P   88   Yb   dP 88YbdP88  dP__Yb    88   88 Yb   dP 88 Y88     Yb      Yb   dP 88 Y88   88   88"Yb  Yb   dP 88  .o     88"Yb  88""   88"Yb  88 Y88 88""   88  .o
88  88  YbodP  88 YY 88 888888     dP""""Yb 'YbodP'   88    YbodP  88 YY 88 dP""""Yb   88   88  YbodP  88  Y8      YboodP  YbodP  88  Y8   88   88  Yb  YbodP  88ood8     88  Yb 888888 88  Yb 88  Y8 888888 88ood8



`);



//console.log('process.platform: ', process.platform);


var axios = require('axios'),
	_     = require('lodash'),
	fs    = require('fs'),

	Relay = require('./relay.js'),
	Rule  = require('./rule.js'),

	PinOutput = require('./pin-output.js'),

	dateString = require('./date-string.js'),

	Metrics = require('./metrics.js'),
	metrics = new Metrics('http://iamjoshhansen.com/coffee-house/index.php');


var now = new Date();
console.log(dateString(now));

console.log('');
console.log('');
console.log('');



var button_led = new PinOutput(21);
button_led.deactivate();

var relay = new Relay(require('./relay.json'));

var rules_data = require('./rules.json'),
rules = _.mapValues(rules_data, (params) => {
	return new Rule(params);
});




function pingAllRules () {
	// console.log('-----------------------------');
	_.each(rules, (rule) => {
		rule.ping();
	});
}
pingAllRules();
setInterval(() => {
	// console.log('ping\t' + _.map(relay.channels, (channel) => {
	// 	return channel.is_active ? 'X' : '-';
	// }).join('') + '\ttimer: ' + (rules.timer.is_active ? 'on' : 'off'));
	pingAllRules();
}, 100);



// if ('hour_chime' in rules) {
// 	rules.hour_chime.on('activate', () => {
// 		ping(`It's the top the hour!`);
// 	});
// } else {
// 	console.warn('Cannot find rule: `hour_chime`, so no pinging for you!!');
// }


if ('working_hours' in rules) {
	console.log('Binding `lamp` channel to `working_hours` rule');
	relay.get('lamp').followRule(rules.working_hours);

	rules.working_hours.on('deactivate', () => {
		ping(`Time to stop working!`);
	});
} else {
	console.warn('Cannot find rule: `working_hours`');
}


/*	Scrum Call
------------------------------------------*/
	if ('scrum_call' in rules) {
		console.log('Binding `green led` to `scrum_call` rule');
		console.log('Will ping when `scrum_call` starts');

		rules.scrum_call
			.on('activate', () => {
				ping(`Scrum Call`);
				button_led.set(true);
			})
			.on('deactivate', () => {
				button_led.set(false);
			});
	} else {
		console.warn('Cannot find rule: `scrum_call`');
	}


/*	Yoga
------------------------------------------*/
	if ('yoga' in rules) {
		console.log('Binding `green led` to `yoga` rule');
		console.log('Will ping when `yoga` starts');

		rules.yoga
			.on('activate', () => {
				ping(`Beer and Yoga!`);
				button_led.set(true);
			})
			.on('deactivate', () => {
				button_led.set(false);
			});
	} else {
		console.warn('Cannot find rule: `yoga`');
	}


/*	Yoga
------------------------------------------*/
if ('still_here' in rules) {
	console.log('Binding `green led` to `still_here` rule');
	console.log('Will ping when `still_here` starts');

	rules.still_here
		.on('activate', () => {
			metrics.post('still-here', {
				date: new Date()
			});
		});
} else {
	console.warn('Cannot find rule: `still_here`');
}


metrics.post('started');


// console.log('Binding `led` channel to `timer` rule');
// rules.timer.on('change:is_active', (is_active) => {
// 	//console.log('timer: ', is_active ? 'on' : 'off');
// 	button_led.set(is_active);
// 	relay.get('lamp').setActiveState(is_active);
// });


relay.on('change:is_active', (index, val) => {
	//console.log('Relay state change [' + index + '] : ' + val);
	fs.appendFile('./change-log.txt', '\n' + new Date().toString() + '\t' + index + '\t' + val);
});




function ping (msg) {
	console.log('PING: ', msg);
	return axios.post('https://maker.ifttt.com/trigger/reminder/with/key/f3HqyRey51BeJWWjrq4I-AP9hy_IosZZ3IZfDR5lGya', {
			value1: msg
		});
}

var ping_the_start = false;

if (ping_the_start) {
	ping('Started the App')
		.then((response) => {
			console.log('response.data: ', response.data);
		})
		.catch((er) => {
			console.log('error: ', er);
		});

}


console.log('Done!');
