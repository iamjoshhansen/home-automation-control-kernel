'use strict';

let Ev = require('./ev.js'),
	duration = require('../duration'),
	_  = require('lodash');

module.exports = class RepeatingSequence extends Ev {

	constructor (params) {

		super(params);

		this.start     = ('start' in params) ? params.start : new Date();
		this.frequency = params.frequency;
		this.sequence  = (typeof(params.sequence) == 'string') ? stringToSequence(params.sequence) : params.sequence;
		this.end       = params.end || null;
		this.exception = params.exception || null;

		this.interval = null;

		let is_active = false;

		Object.defineProperty(this, 'is_active', {
			enumerable: true,
			get: () => {
				return is_active;
			},
			set: (val) => {
				if (is_active != val) {
					let old_is_active = is_active;
					is_active = val;
					this.trigger('change:is_active', is_active);
					this.trigger(is_active ? 'activate' : 'deactivate');
				}
			}
		});

		const sequence_duration = _.sum(_.map(this.sequence, (seg) => {
			return duration(seg.duration);
		}));

		Object.defineProperty(this, 'duration', {
			enumerable: true,
			value: sequence_duration,
		});

		//this.activate();
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
			time_since_start = (now.getTime() - start.getTime()) % duration(this.frequency);

		//console.log('time_since_start: ', time_since_start);

		if (time_since_start < 0 || time_since_start > this.duration) {
			this.is_active = false;
			this.state = false;
		} else {

			let cursor = -1;
			let time_elapsed = duration(this.sequence[0].duration);
			const len = this.sequence.length;
			while(++cursor<len && time_elapsed < time_since_start) {
				if (cursor < len-1) {
					time_elapsed += duration(this.sequence[cursor+1].duration);
				}
			}

			this.is_active = true;
			this.state = ('state' in this.sequence[cursor]) ? this.sequence[cursor].state : true;
		}
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
			sequence  : this.sequence,
			exception : this.exception
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
