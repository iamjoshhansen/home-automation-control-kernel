'use strict';

let _     = require('lodash');

function duration (amount) {

	amount = amount.replace(/ /g,'');

	var segments = [],
		digit = '',
		value = '',
		mode = 'd';

		_.each(amount, (c) => {
		if (('0123456789.').indexOf(c) > -1) {
			if (mode == 'v') {
				segments.push(digit + value);
				digit = '';
				value = '';
				mode = 'd';
			}
			digit += c;
		} else {
			value += c;
			if (mode == 'd') {
				mode = 'v';
			}
		}
	});
	segments.push(digit + value);

	return _.sum(_.map(segments, simpleDuration));
}

function simpleDuration (amount) {
	var numbers = parseFloat(amount.match(/\d/g).join('')),
		letters = amount.match(/\D/g).join('');

	return numbers * duration.map[letters];
}

duration.map = {
	'y' : 1000 * 60 * 60 * 24 * 365,
	'w' : 1000 * 60 * 60 * 24 * 7,
	'd' : 1000 * 60 * 60 * 24,
	'h' : 1000 * 60 * 60,
	'm' : 1000 * 60,
	's' : 1000,
	'i' : 1
};

module.exports = duration;
