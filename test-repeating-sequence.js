const RepeatingSequence = require('./components/evs/repeating-sequence-2');
const dateString = require('./components/date-string');

const seq = new RepeatingSequence({
	label: "Test",
	start: new Date('2017-09-22 12:00 AM'),
	frequency: '1h',
	sequence: '10m:warm 20m:run 15m:cool'
});

// console.log('seq.sequence: ', seq.sequence);

const given_date = new Date('2017-09-22 12:10 AM');

const state = seq.getState(given_date);
console.log('           state: ', state);


const last_start_date = seq.getLastStartDate(given_date);
console.log(' last_start_date: ', dateString(last_start_date));

const next_change_date = seq.getNextChangeDate(given_date);
console.log('next_change_date: ', dateString(next_change_date));
