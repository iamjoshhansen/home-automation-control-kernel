'use strict';

var Emitter = require('./emitter.js');

module.exports = class Channel extends Emitter {

	constructor (pin, label) {

		super();

		this.pin   = pin;
		this.label = label;
		this.state = false;

	}

	setState (val) {
		var new_val = !! val;

		if (new_val != this.state) {
			this.state = !! val;
			this.trigger('change:state', this.state);
			this.trigger('change:state:' + (this.state ? 'on' : 'off'));
		}

		return this;
	}

	toggleState () {
		return this.setState( ! this.state);
	}

	toJSON () {
		return {
			pin: this.pin,
			label: this.label,
			state: this.state
		};
	}
}
