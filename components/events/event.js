'use strict';

var Emitter = require('../emitter.js'),
	_       = require('lodash');

module.exports = class Event extends Emitter {

	constructor (params) {

		super();

		this.title    = params.title;

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
			title : this.title,
			state : this.state
		};
	}
}
