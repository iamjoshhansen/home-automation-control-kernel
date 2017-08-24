'use strict';

let Deferred = require('./components/deferred.js');

let dfr = new Deferred();

dfr
	.always((a, b) => {
		console.log('Start');
		console.log('  a: ', a);
	})
	.done((a, b) => {
		console.log('Done.');
		console.log('  a: ', a);
	})
	.fail((a, b) => {
		console.log('Fail.');
		console.log('  a: ', a);
	})
	.always((a, b) => {
		console.log('End');
		console.log('  a: ', a);
	});

setTimeout(() => {
	dfr.resolve('alpha');
	console.log('-- resolved');
}, 1000);

setTimeout(() => {
	dfr.reject('charlie');
	console.log('-- rejected');
}, 1500);

console.log('EOF');
