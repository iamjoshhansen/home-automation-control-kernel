'use strict';

let Deferred    = require('./components/deferred.js'),
	DeferredSet = require('./components/deferred-set.js');

let a = new Deferred(),
	b = new Deferred(),
	c = new Deferred();

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
	});

setTimeout(() => {
	a.resolve('alpha');
	console.log('-- resolved a');
}, 200);

setTimeout(() => {
	b.resolve('bravo');
	console.log('-- resolved b');
}, 400);

setTimeout(() => {
	c.resolve('charlie');
	console.log('-- resolved c');
}, 600);

console.log('EOF');
