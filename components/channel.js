'use strict';

var Emitter   = require('./emitter.js'),
	PinOutput = require('./pin-output.js');

module.exports = class Channel extends Emitter {

	constructor (id, params) {

		super();

		this.id = id;

		this.label = params.label;
		this.is_active = false;

		this.pin = new PinOutput(params.pin);

		// initializing
		//console.log('Initializing pin: ' + this.pin.id + ' ' + this.label);
		this.pin.set(this.is_active);

	}

	setActiveState (val) {
		var new_val = !! val;

		if (new_val != this.is_active) {
			this.is_active = !! val;
			this.pin.set(this.is_active);
			this.trigger('change', this.is_active);
			this.trigger(this.is_active ? 'activate' : 'deactivate');
		}

		return this;
	}

	followRule (rule, _inverted) {
		var self = this;
		rule.on('change', (is_active) => {
			//console.log('followRule triggered `' + self.id + '`:' + (is_active ? 'active' : 'inactive'));
			if (_inverted) {
				self.setActiveState( ! is_active);
			} else {
				self.setActiveState(is_active);
			}
		});
	}

	toggle () {
		return this.setActiveState( ! this.is_active);
	}

	toJSON () {
		return {
			pin       : this.pin.id,
			label     : this.label,
			is_active : this.is_active
		};
	}
}
