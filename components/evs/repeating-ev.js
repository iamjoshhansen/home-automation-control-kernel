'use strict';

let Ev = require('./ev.js'),
	duration = require('../duration'),
	_  = require('lodash');

module.exports = class RepeatingEv extends Ev {

	constructor (params) {

		super(params);

		this.start     = params.start;
		this.frequency = params.frequency;
		this.duration  = params.duration;
		this.end       = params.end || null;
		this.exception = params.exception || null;

		this.interval = null;

		this.activate();
	}

	_ping () {
		var now   = new Date();

		if (this.exception) {
			var dow = ('UMTWUFS').charAt(now.getDay());
			if (_.includes(this.exception.split(''), dow)) {
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
			delta = (now.getTime() - start.getTime()) % duration(this.frequency);

		this.state = delta < duration(this.duration);
	}

	activate () {

		var self = this;

		this._ping();
		this.interval = setInterval(() => {
			self._ping();
		}, 100);

		return self;
	}

	deactivate () {
		clearTimeout(this.interval);
	}

	toJSON () {
		return _.extend(super.toJSON(), {
			start     : this.start,
			end       : this.end,
			frequency : this.frequency,
			duration  : this.duration,
			exception : this.exception
		});
	}
}
