'use strict';

let Event = require('./event.js'),
	_     = require('lodash');

module.exports = class RepeatingEvent extends Event {

	constructor (params) {

		super(params);

		this.start    = params.start;
		this.end      = params.end;
		this.every    = params.every;
		this.for      = params.for;
		this.not      = params.not;

		this.interval = null;

		this.activate();

	}

	ping () {
		var now   = new Date();

		if (this.not) {
			var dow = ('UMTWUFS').charAt(now.getDay());
			if (_.includes(this.not.split(''), dow)) {
				this.state = false;
				return this;
			}
		}

		if (this.end) {
			let end = new Date(this.end);
			if (now > end) {
				this.state = false;
				return this;
			}
		}

		var start = new Date(this.start),
			delta = (now - start) % duration(this.every);

		this.state = delta < duration(this.for);
	}

	activate () {

		var self = this;

		this.ping();
		this.interval = setInterval(() => {
			self.ping();
		}, 100);

		return self;
	}

	deactivate () {
		clearTimeout(this.interval);
	}

	toJSON () {
		return _.extend(super.toJSON(), {
			start     : this.start,
			every     : this.every,
			for       : this.for,
			not       : this.not
		});
	}
}


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
	'w' : 1000 * 60 * 60 * 24 * 7,
	'd' : 1000 * 60 * 60 * 24,
	'h' : 1000 * 60 * 60,
	'm' : 1000 * 60,
	's' : 1000
};
