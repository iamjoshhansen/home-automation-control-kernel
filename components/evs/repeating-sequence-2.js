'use strict';

let Ev = require('./ev.js'),
	duration = require('../duration'),
	_  = require('lodash');

module.exports = class RepeatingSequence extends Ev {

	constructor (params) {

		super(params);

		this.start     = ('start' in params) ? params.start : new Date();
		this.frequency = duration(params.frequency);
		this.sequence  = (typeof(params.sequence) == 'string') ? stringToSequence(params.sequence) : params.sequence;
		this.end       = this.end ? new Date(params.end) : null;

		this.interval = null;

		this.duration = _.sum(_.map(this.sequence, (seg) => {
			return duration(seg.duration);
		}));

		//this.activate();
	}

	getState (given_date) {
		const date = given_date ? new Date(given_date) : new Date();

		if (this.end) {
			if (date.getTime() > this.end.getTime()) {
				return false;
			}
		}

		const time_since_start = (date.getTime() - this.start.getTime()) % this.frequency;

		//console.log('time_since_start: ', time_since_start);

		if (time_since_start < 0 || time_since_start > this.duration) {
			return false;
		} else {

			let cursor = -1;
			let time_elapsed = duration(this.sequence[0].duration);
			const len = this.sequence.length;
			while(++cursor<len && time_elapsed < time_since_start) {
				if (cursor < len-1) {
					time_elapsed += duration(this.sequence[cursor+1].duration);
				}
			}

			return ('state' in this.sequence[cursor]) ? this.sequence[cursor].state : true;
		}
	}


	getLastStartDate (given_date) {
		const date = given_date || new Date();
		return new Date(this.start.getTime() + Math.floor((date.getTime() - this.start.getTime()) / this.frequency) * this.frequency);
	}


	getNextChangeDate (given_date) {

		const date = given_date || new Date();

		if (this.end) {
			if (date.getTime() > this.end.getTime()) {
				return null;
			}
		}

		if (this.start > date) {
			return new Date(this.start);
		} else {

			const last_start_date = this.getLastStartDate();
			const time_since_start = (date.getTime() - last_start_date.getTime());

			let cursor = -1;
			let time_elapsed = 0;
			const len = this.sequence.length;
			while(++cursor<len && time_elapsed < time_since_start) {
				time_elapsed += duration(this.sequence[cursor].duration);
			}

			if (cursor === len) {
				return new Date(last_start_date.getTime() + this.frequency);
			} else {
				return new Date(last_start_date.getTime() + time_elapsed);
			}
		}
	}



	activate () {

		this.state = this.getState();
		const next_change = this.getNextChangeDate();

		if (next_change) {
			this.interval = setTimeout(() => {
				this.activate();
			}, new Date().getTime() - next_change.getTime());
		}

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
			sequence  : this.sequence,
		});
	}
}


function stringToSequence (str) {
	let sequence = [];

	var steps = str.split(' ');
	steps.forEach((seg) => {

		let segs = seg.split(':');
		let duration = segs[0];

		let state = (segs.length > 1) ? segs[1] : false;
		if (state === 'false') {
			state = false;
		} else if (state === 'true') {
			state = true;
		} else if (state === 'null') {
			state = null;
		}

		sequence.push({
			duration,
			state
		});
	});

	return sequence;
}
