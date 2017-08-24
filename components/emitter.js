'use strict';

var _ = require('lodash');

module.exports = class Emiter {

	constructor () {

		this.callbacks = {};

	}

	on (ev, cb) {
		if ( ! (ev in this.callbacks)) {
			this.callbacks[ev] = [];
		}

		this.callbacks[ev].push(cb);

		return this;
	}

	off (ev) {
		if (ev in this.callbacks) {
			delete this.callbacks[ev];
		}

		return this;
	}

	trigger (ev, args) {

		if ( ! _.isArray(args)) {
			args = [args];
		}

		var self = this;

		if (ev in this.callbacks) {
			_.each(this.callbacks[ev], (cb) => {
				cb.apply(self, args);
			});
		}

		return this;
	}

}
