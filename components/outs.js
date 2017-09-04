'use strict';

var Emitter = require('./emitter.js'),
	_       = require('lodash'),
	Out     = require('./out.js');

module.exports = class Outs extends Emitter {

	constructor (params) {

		super();

		let self = this;
		this.outs = {};

		_.each(params, (obj, id) => {
			var out = new Out(id, obj);
			out.on('change', (is_active) => {
				self.trigger('change', [id, is_active]);
				self.trigger('change:'+id, is_active);
			});

			self.outs[id] = out;
		});

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
