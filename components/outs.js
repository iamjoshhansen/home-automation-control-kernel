'use strict';

var Emitter = require('./emitter.js'),
	_       = require('lodash'),
	Out     = require('./out.js');

module.exports = class Outs extends Emitter {

	constructor (outs) {

		super();

		this.outs = {};

		if (outs) {
			_.each(outs, (obj, id) => {
				this.createOut(id, obj);
			});
		}

	}

	createOut (id, out_data) {
		const out = new Out(id, out_data);

		out
			.on('change', (is_active) => {
				this.trigger('change', [id, is_active]);
				this.trigger(`change:${id}`, is_active);
			})
			.on('change-reasons', (reasons) => {
				console.log(`native outs noticed a change in ${id}'s reasons: [${reasons.length}] ${reasons}`);
				this.trigger(`change-reasons`, [id, reasons]);
				this.trigger(`change-reasons:${id}`, [reasons]);
			})
			.on('add-reason', (reason) => {
				this.trigger(`add-reason`, [id, reason]);
				this.trigger(`add-reasons:${id}`, reason);
			})
			.on('remove-reason', (reason) => {
				this.trigger(`remove-reason`, [id, reason]);
				this.trigger(`remove-reasons:${id}`, reason);
			});

		this.outs[id] = out;

		return out;
	}

	get (id) {
		if (id in this.outs) {
			return this.outs[id];
		} else {
			console.log(' ! Attempted to get unknown id from outs: `' + id + '`');
			return null;
		}
	}

	toJSON () {
		return this.outs;
	}
}
