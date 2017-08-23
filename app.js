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
	Rule  = require('./rule.js');


var relay = new Relay(require('./relay.json'));

relay.channels[0].on('change:state:on', () => {
	ping(`It's the top the hour!`);
});

relay.channels[1].on('change:state:on', () => {
	ping(`Time to start working...`);
});

relay.channels[1].on('change:state:off', () => {
	ping(`Time to stop working!`);
});

relay.on('change:state', (index, val) => {
	console.log('Relay state change [' + index + '] : ' + val);
	fs.appendFile('./change-log.txt', '\n' + new Date().toString() + '\t' + index + '\t' + val);
});

var rules_data = require('./rules.json'),
	rules = _.map(rules_data, (params) => {
		return new Rule(params);
	});



function ping (msg) {
	return axios.post('https://maker.ifttt.com/trigger/reminder/with/key/f3HqyRey51BeJWWjrq4I-AP9hy_IosZZ3IZfDR5lGya', {
			value1: msg
		});
}



setInterval(() => {

	var reasons = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
	_.each(rules, (rule) => {
		var is_active = rule.isActive();

		if (is_active) {
			_.each(rule.channels, (channel) => {
				reasons[channel].push(rule.title);
			});
		}
	});

	_.each(reasons, (reason, i) => {
		relay.setState(i, reason.length > 0);
	});

	fs.writeFile('./state.json', JSON.stringify(relay, null, 4));

	console.log(_.map(relay.channels, (channel) => {
		return channel.state ? 'X' : '_';
	}).join(' '));

}, 1000);

if (false) {
	ping('Started the App')
		.then((response) => {
			console.log('response.data: ', response.data);
		})
		.catch((er) => {
			console.log('error: ', er);
		});

}
