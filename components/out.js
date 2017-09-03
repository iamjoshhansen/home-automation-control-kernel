'use strict';

var Emitter   = require('./emitter.js'),
	OutputPin = require('./pin-output.js'),
	_         = require('lodash');

module.exports = class Out extends Emitter {

	constructor (params) {

		super();

		let self = this;
		this.label = params.label;
		this.pin = new OutputPin(params.pin);
	}

	set (bool) {
		bool = !! bool;
		if (bool !== this.pin.is_active) {
			this.pin.set(bool);
			this.trigger('change', bool);
			this.trigger(bool ? 'activate' : 'deactivate');
		}

		return this;
	}

	get () {
		return this.pin.get();
	}

	activate () {
		return this.set(true);
	}

	deactivate () {
		return this.set(false);
	}

	toggle () {
		this.set( ! this.get());
	}

	toJSON () {
		return {
			label     : this.label,
			pin       : this.pin.id,
			is_active : this.pin.is_active
		};
	}
}
