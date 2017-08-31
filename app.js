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

	Relay = require('./components/relay.js'),
	Rule  = require('./components/rule.js'),

	PinOutput = require('./components/pin-output.js'),

	dateString = require('./components/date-string.js'),

	Metrics = require('./components/metrics.js'),
	metrics = new Metrics('http://iamjoshhansen.com/coffee-house/index.php'),

	Deferred    = require('./components/deferred.js'),
	DeferredSet = require('./components/deferred-set.js'),
	CoffeeHouse = require('./components/coffee-house/coffee-house.js'),

	flags = require('./flags.json');


var now = new Date();
console.log(dateString(now));

console.log('');
console.log('');
console.log('');

let db = new CoffeeHouse('http://iamjoshhansen.com/coffee-house/');


let relay = null,
	rules = null;


/*	Rules
------------------------------------------*/
	let rules_dfr = new Deferred();

	rules_dfr
		.done((properties) => {
			rules = _.mapValues(properties, (params) => {
				return new Rule(params);
			});

			console.log('Rules: ', _.keys(rules).join(', '));
		})
		.fail((er) => {
			console.log('rules: fail');
			console.error(er);
		});

	db.table('preferences').fetch('rules')
		.done((doc) => {
			rules_dfr.resolve(doc.properties);
		});


/*	Channels
------------------------------------------*/
	let channels_dfr = new Deferred();

	channels_dfr
		.done((properties) => {
			//console.log('channel properties: ', properties);
			relay = new Relay(properties);
			console.log('Channels: ', _.keys(relay.channels).join(', '));
		})
		.fail((er) => {
			console.log('channels: fail');
			console.error(er);
		});

	let channels_doc = null;
	db.table('preferences').fetch('channels')
		.done((doc) => {
			channels_doc = doc;
			channels_dfr.resolve(channels_doc.properties);
		});




//let preferences = db.table('preferences');
//let the_fam = preferences.get('fam');

//console.log('the_fam.is_new: ', the_fam.is_new);

// let fam_dfr = the_fam.fetch()
// 	.done((response) => {
// 		console.log('fam fetch response: ', response.data);
// 	})
// 	.fail((er) => {
// 		the_fam.set({
// 			josh: 30,
// 			charlie: 28
// 		})
// 			.save()
// 			.done((response) => {
// 				console.log('fam fetch 2x response: ', response.data);
// 			})
// 			.fail((er) => {
// 				console.log('Nope! Second attempt failed');
// 			});
// 	});




if (flags.manual_switch) {
	let ManualSwitchEvent = require('./components/events/manual-switch-event.js');
	let ms_ev = new ManualSwitchEvent({
			endpoint: 'http://iamjoshhansen.com/coffee-house/',
			table: 'preferences',
			doc: 'manual'
		});

	ms_ev.on('change', (id, state) => {
		console.log('change state: ', id, state);

		relay[state ? 'activate' : 'deactivate']([_.keys(relay.channels)[id]]);
	});
}




let ready = new DeferredSet({
		rules_dfr,
		channels_dfr
	});


var si = setInterval(() => {
	console.log('.');
}, 100);


ready
	.always(() => {
		clearTimeout(si);
		console.log('Ready is over');
	})
	.done(() => {

		// todo: Test this.
		/* relay
			.on('change:is_active', (id, is_active) => {
				let params = {};
				params[id] = channels_doc.properties[id];
				params[id].is_active = is_active;
				channels_doc
					.set(params)
					.save();
			}); */

		console.log('\n\n------- Ready! -------\n\n');

		var button_led = new PinOutput(21);
		button_led.deactivate();


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
		// 	console.log('!!! Cannot find rule: `hour_chime`, so no pinging for you!!');
		// }


		// if ('working_hours' in rules) {
		// 	console.log('Binding `salt_lamp` channel to `working_hours` rule...');

		// 	let salt_lamp = relay.get('salt_lamp');
		// 	//console.log('salt_lamp: ', salt_lamp);

		// 	salt_lamp.followRule(rules.working_hours);
		// 	console.log('...done');

		// 	console.log('Binding a ping to remind when to stop working.');
		// 	rules.working_hours.on('deactivate', () => {
		// 		ping(`Time to stop working!`);
		// 	});
		// 	console.log('..done');
		// } else {
		// 	console.log('!!! Cannot find rule: `working_hours`');
		// }


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
				console.log('!!! Cannot find rule: `scrum_call`');
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
				console.log('!!! Cannot find rule: `yoga`');
			}


		/*	Still Here
		------------------------------------------*/
			if ('still_here' in rules) {
				console.log('Binding `green led` to `still_here` rule');
				console.log('Will ping when `still_here` starts');

				rules.still_here
					.on('activate', () => {
						metrics.post('still-here', {
							date: new Date()
						});

						relay.channels.led_lamp.toggleActiveState();
					});
			} else {
				console.log('!!! Cannot find rule: `still_here`');
			}


		/*	Sprinkler Warning
		------------------------------------------*/
			if ('sprinkler_warning' in rules) {
				console.log('Will ping when `sprinkler_warning` starts');

				rules.sprinkler_warning
					.on('activate', () => {
						ping(`Soon: Sprinklers`);
						relay.channels.salt_lamp.setActiveState(true);
					})
					.on('deactivate', () => {
						relay.channels.salt_lamp.setActiveState(false);
					});
			} else {
				console.log('!!! Cannot find rule: `sprinkler_front`');
			}

		/*	Sprinkler: Front
		------------------------------------------*/
			if ('sprinkler_front' in rules) {
				console.log('Will ping when `sprinkler_front` starts');

				rules.sprinkler_front
					.on('activate', () => {
						ping(`Front Sprinklers`);
						relay.channels.sprinkler_front.setActiveState(true);
						relay.channels.fountain.setActiveState(true);
					})
					.on('deactivate', () => {
						relay.channels.sprinkler_front.setActiveState(false);
						relay.channels.fountain.setActiveState(false);
					});
			} else {
				console.log('!!! Cannot find rule: `sprinkler_front`');
			}


		/*	Sprinkler: Sidewalk
		------------------------------------------*/
			if ('sprinkler_sidewalk' in rules) {
				console.log('Will ping when `sprinkler_sidewalk` starts');

				rules.sprinkler_sidewalk
					.on('activate', () => {
						ping(`Sidewalk Sprinklers`);
						relay.channels.sprinkler_sidewalk.setActiveState(true);
						relay.channels.fountain.setActiveState(true);
					})
					.on('deactivate', () => {
						relay.channels.sprinkler_sidewalk.setActiveStatefalse();
						relay.channels.fountain.setActiveState(false);
					});
			} else {
				console.log('!!! Cannot find rule: `sprinkler_sidewalk`');
			}


		/*	Drip: Front
		------------------------------------------*/
			if ('drip_front' in rules) {
				console.log('Will ping when `drip_front` starts');

				rules.drip_front
					.on('activate', () => {
						ping(`Drip: Front`);
						relay.channels.drip_front.setActiveState(true);
						relay.channels.fountain.setActiveState(true);
					})
					.on('deactivate', () => {
						relay.channels.drip_front.setActiveStatefalse();
						relay.channels.fountain.setActiveState(false);
					});
			} else {
				console.log('!!! Cannot find rule: `drip_front`');
			}


		metrics.post('started');


		// console.log('Binding `led` channel to `timer` rule');
		// rules.timer.on('change:is_active', (is_active) => {
		// 	//console.log('timer: ', is_active ? 'on' : 'off');
		// 	button_led.set(is_active);
		// 	relay.get('led_lamp').setActiveState(is_active);
		// });


		/* relay.on('change:is_active', (index, val) => {
			//console.log('Relay state change [' + index + '] : ' + val);
			fs.appendFile('./change-log.txt', '\n' + new Date().toString() + '\t' + index + '\t' + val);
		}); */




		function ping (msg) {
			console.log('PING: ', msg);
			return axios.post('https://maker.ifttt.com/trigger/reminder/with/key/f3HqyRey51BeJWWjrq4I-AP9hy_IosZZ3IZfDR5lGya', {
					value1: msg
				});
		}

		relay.channels.led_lamp.toggleActiveState();

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

		console.log('\n\n-- ready complete --');

	})
	.fail((er) => {
		console.log('Ready failed');
	});



console.log('[ EOF ]');
