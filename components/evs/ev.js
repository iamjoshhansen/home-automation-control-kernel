'use strict';

var Emitter = require('../emitter.js');

class Ev extends Emitter {

	constructor (params) {

		super();

		const self = this;

		this.label = params.label;
		let state = false;

		Object.defineProperty(this, 'state', {
			enumerable: true,
			get: () => {
				return state;
			},
			set: (val) => {
				if (state != val) {
					let old_state = state;
					state = val;
					self.trigger('change', [state, old_state]);
					self.trigger(state ? 'activate' : 'deactivate');
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


