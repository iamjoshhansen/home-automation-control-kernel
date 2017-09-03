'use strict';

var Emitter = require('../emitter.js'),
	_       = require('lodash');

class Ev extends Emitter {

	constructor (params) {

		super();

		this.label    = params.label;

		var self = this,
			state = false;

		Object.defineProperty(this, 'state', {
			enumerable: true,
			get: () => {
				return state;
			},
			set: (val) => {
				if (state != val) {
					state = val;
					self.trigger('change', state);
				}
			}
		});

	}

	toJSON () {
		return {
			label : this.label,
			state : this.state
		};
	}
}

module.exports = Ev;

Ev.Repeating = require('./repeating-ev.js');


