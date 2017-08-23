'use strict';

var Emitter = require('./emitter.js'),
	_ = require('lodash');

module.exports = class Rule extends Emitter {

	constructor (params) {

		super();

		this.title    = params.title;
		this.start    = params.start;
		this.every    = params.every;
		this.for      = params.for;
		this.not      = params.not;
		this.channels = params.channels;

		var self = this,
			is_active = false;

		Object.defineProperty(this, 'is_active', {
			enumerable: true,
			get: () => {
				return is_active;
			},
			set: (bool) => {
				bool = !! bool;
				if (is_active != bool) {
					is_active = bool;
					self.trigger('change:is_active', is_active);
					self.trigger('change:is_active:' + (is_active ? 'true' : 'false'));
					self.trigger(is_active ? 'activate' : 'deactivate');
				}
			}
		});

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

		var start = new Date(this.start),
			delta = (now - start) % duration(this.every);

		this.state = delta < duration(this.for);

		return this;
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
