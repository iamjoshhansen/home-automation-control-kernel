'use strict';

console.log(`



.  .                  ,.      .                 .                ,-.         .           .   ,  ,                 .
|  |                 /  \\     |                 |   o           /            |           |   | /                  |
|--| ,-. ;-.-. ,-.   |--| . . |-  ,-. ;-.-. ,-: |-  . ,-. ;-.   |    ,-. ;-. |-  ;-. ,-. |   |<   ,-. ;-. ;-. ,-: |
|  | | | | | | |-'   |  | | | |   | | | | | | | |   | | | | |   \\    | | | | |   |   | | |   | \\  |-' |   | | | | |
'  ' '-' ' ' ' '-'   '  ' '-' '-' '-' ' ' ' '-' '-' ' '-' ' '    '-' '-' ' ' '-' '   '-' '   '  ' '-' '   ' ' '-' '



`);



var axios = require('axios'),
	_     = require('lodash'),
	fs    = require('fs'),

	Relay = require('./relay.js'),
	Rule  = require('./rule.js'),

	// Gpio  = require('./onoff-fake.js').Gpio;
	Gpio  = require('onoff').Gpio;


var button_led = new Gpio(21, 'out');

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
	console.log('ping\t' + _.map(relay.channels, (channel) => {
		return channel.is_active ? 'X' : '-';
	}).join('') + '\ttimer: ' + (rules.timer.is_active ? 'on' : 'off'));
	pingAllRules();
}, 1000);



if ('hour_chime' in rules) {
	rules.hour_chime.on('activate', () => {
		ping(`It's the top the hour!`);
	});
} else{
	console.warn('Cannot find rule: `hour_chime`');
}

if ('working_hours' in rules) {
	console.log('Binding `lamp` channel to `working_hours` rule');
	relay.channels.lamp.followRule(rules.working_hours);
}

console.log('Binding `sprinkler: front` channel to `timer` rule');
relay.channels['sprinkler: front'].followRule(rules.timer);


relay.channels.lamp.on('activate', () => {
	console.log('The lamp is: ON');
});

relay.on('deactivate:lamp', () => {
	console.log('The lamp is: OFF');
	ping(`Time to stop working!`);
});

relay.on('change:is_active', (index, val) => {
	console.log('Relay state change [' + index + '] : ' + val);
	fs.appendFile('./change-log.txt', '\n' + new Date().toString() + '\t' + index + '\t' + val);
});




function ping (msg) {
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
