'use strict';

const RepeatingEvent = require('./components/evs/repeating-ev-2');
const dateString = require('./components/date-string');

const ev = new RepeatingEvent({
		start: '2017-09-17 8:00 AM',
		frequency: '10i',
		duration: '1i',
		end: '2017-09-17 10:00 PM',
	});

console.log('       now: ', dateString(new Date()));
console.log('     state: ', ev.state);
console.log('     start: ', dateString(ev.start));
console.log('  duration: ', ev.duration);
console.log('Next start: ', dateString(ev.getNextStart()));
console.log('  Next end: ', dateString(ev.getNextEnd()));

ev.on('activate', () => {
	console.log('activated ', dateString(new Date()));
});
