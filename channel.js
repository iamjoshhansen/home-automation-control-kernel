'use strict';

var Emitter = require('./emitter.js'),
	Gpio    = require('onoff').Gpio;

module.exports = class Channel extends Emitter {

	constructor (id, params) {

		super();

		this.id = id;

		this.label = params.label;
		this.is_active = false;

		Object.defineProperty(this, 'pin', {
			value: params.pin,
			enumerable: true,
			writable: false
		});

		this.io = new Gpio(params.pin, 'out');

		// initializing
		this.io.writeSync(this.is_active ? 1 : 0);

	}

	setActiveState (val) {
		var new_val = !! val;

		if (new_val != this.is_active) {
			this.is_active = !! val;
			this.io.writeSync(this.is_active ? 1 : 0);
			this.trigger('change:is_active', this.is_active);
			this.trigger('change:is_active:' + (this.is_active ? 'on' : 'off'));
			this.trigger(this.is_active ? 'activate' : 'deactivate');
		}

		return this;
	}

	followRule (rule, _inverted) {
		var self = this;
		rule.on('change:is_active', (is_active) => {
			if (_inverted) {
				self.setActiveState( ! is_active);
			} else {
				self.setActiveState(is_active);
			}
		});
	}

	toggleActiveState () {
		return this.setActiveState( ! this.is_active);
	}

	toJSON () {
		return {
			pin       : this.pin,
			label     : this.label,
			is_active : this.is_active
		};
	}
}
