'use strict';

let Ev = require('./ev.js'),
	duration = require('../duration'),
	_  = require('lodash');

module.exports = class RepeatingEv extends Ev {

	constructor (params) {

		super(params);

		this.start     = ('start' in params) ? new Date(params.start) : new Date();
		this.frequency = duration(params.frequency);
		this.duration  = duration(params.duration);
		this.end       = ('end' in params) ? new Date(params.end) : null;

		this.interval = null;

		this.activate();
	}

	isActive () {
		const now   = new Date();

		if (this.end) {
			let end = new Date(this.end);
			if (now > end) {
				this.state = false;
				return this;
			}
		}

		var start = new Date(this.start),
			delta = (now.getTime() - start.getTime()) % this.frequency;

		return delta < this.duration;
	}

	getNextStart (given_date) {
		const now = given_date || new Date();
		if (this.end) {
			if (now > this.end) {
				return null;
			}
		}
		if (this.start > now) {
			return new Date(this.start);
		} else {
			return new Date(now.getTime() + (this.frequency - ((now.getTime() - this.start.getTime()) % this.frequency)));
		}
	}

	getNextEnd(given_date) {
		const now = given_date || new Date();
		const end_a = new Date((now.getTime() + (this.frequency - ((now.getTime() - this.start.getTime()) % this.frequency))) + this.duration);
		const end_b = new Date(end_a.getTime() - this.frequency);

		return (now > end_b) ? end_a : end_b;
	}

	activate () {

		this.state = this.isActive();

		const now = new Date();
		let time_until_change = 0;

		if (this.isActive()) {
			time_until_change = now.getTime() - this.getNextEnd().getTime();
		} else {
			time_until_change = now.getTime() - this.getNextStart().getTime();
		}

		this.interval = setTimeout(() => {
			this.activate();
		}, time_until_change);

		return this;
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
		});
	}
}
