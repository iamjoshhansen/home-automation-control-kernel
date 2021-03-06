'use strict';

let Deferred    = require('./components/deferred.js'),
	DeferredSet = require('./components/deferred-set.js');

let a_val = 'ALPHA',
	b_val = 'BRAVO',
	c_val = 'CHARLIE';

let a = new Deferred(),
	b = new Deferred(),
	c = new Deferred();


a.done(() => { a_val += ' (edited)'; });
b.done(() => { b_val += ' (edited)'; });
c.done(() => { c_val += ' (edited)'; });


let dfr_set = new DeferredSet({ a, b, c });

dfr_set
	.always((responses) => {
		console.log('Start');
		console.log('responses: ', responses);
	})
	.done((responses) => {
		console.log('Done.');
		console.log('responses: ', responses);
	})
	.fail((responses) => {
		console.log('Fail.');
		console.log('responses: ', responses);
	})
	.always((responses) => {
		console.log('End');
		console.log('responses: ', responses);
		console.log('a_val: ', a_val);
		console.log('b_val: ', b_val);
		console.log('c_val: ', c_val);
	});

setTimeout(() => {
	a.resolve('alpha');
	console.log('-- resolved a');
}, 500);

setTimeout(() => {
	b.resolve('bravo');
	console.log('-- resolved b');
}, 1000);

setTimeout(() => {
	c.resolve('charlie');
	console.log('-- resolved c');
}, 200);

console.log('EOF');
