'use strict';

console.log(`



.  .                  ,.      .                 .                ,-.         .           .   ,  ,                 .
|  |                 /  \\     |                 |   o           /            |           |   | /                  |
|--| ,-. ;-.-. ,-.   |--| . . |-  ,-. ;-.-. ,-: |-  . ,-. ;-.   |    ,-. ;-. |-  ;-. ,-. |   |<   ,-. ;-. ;-. ,-: |
|  | | | | | | |-'   |  | | | |   | | | | | | | |   | | | | |   \\    | | | | |   |   | | |   | \\  |-' |   | | | | |
'  ' '-' ' ' ' '-'   '  ' '-' '-' '-' ' ' ' '-' '-' ' '-' ' '    '-' '-' ' ' '-' '   '-' '   '  ' '-' '   ' ' '-' '



`);



console.log('process.platform: ', process.platform);


var axios = require('axios'),
	_     = require('lodash'),
	fs    = require('fs'),

	Relay = require('./relay.js'),
	Rule  = require('./rule.js'),

	PinOutput = require('./pin-output.js');


var button_led = new PinOutput(21);

var relay = new Relay(require('./relay.json'));

var rules_data = require('./rules.json'),
rules = _.mapValues(rules_data, (params) => {
	return new Rule(params);
});




function pingAllRules () {
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

console.log('Binding `led` channel to `timer` rule');
rules.timer.on('change:is_active', (is_active) => {
	console.log('timer: ', is_active ? 'on' : 'off');
	button_led.set(is_active);
});


relay.on('change:is_active', (index, val) => {
	console.log('Relay state change [' + index + '] : ' + val);
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


console.log('\n\n\nRules');
console.log(JSON.stringify(rules, null, 4));

console.log('\n\n\nChannels');
console.log(JSON.stringify(relay, null, 4));

console.log('Done!');
