'use strict';

var _ = require('lodash');

module.exports = class Rule {

	constructor (params) {

		this.title    = params.title;
		this.start    = params.start;
		this.every    = params.every;
		this.for      = params.for;
		this.not      = params.not;
		this.channels = params.channels;

	}

	isActive () {
		var now   = new Date();

		if (this.not) {
			var dow = ('UMTWUFS').charAt(now.getDay());
			if (_.includes(this.not.split(''), dow)) {
				return false;
			}
		}

		var start = new Date(this.start),
			delta = (now - start) % duration(this.every);

		return delta < duration(this.for);
	}

};



function duration (amount) {

	var numbers = parseInt(amount.match(/\d/g).join(''), 10),
		letters = amount.match(/\D/g).join('');

	return numbers * duration.map[letters];

}

duration.map = {
	'w' : 1000 * 60 * 60 * 24 * 7,
	'd' : 1000 * 60 * 60 * 24,
	'h' : 1000 * 60 * 60,
	'm' : 1000 * 60,
	's' : 1000
};
