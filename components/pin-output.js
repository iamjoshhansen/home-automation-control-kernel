'use strict';

var Emitter = require('./emitter.js'),
	Gpio    = require( (process.platform == 'darwin') ? './onoff-fake.js' : 'onoff').Gpio;

module.exports = class OutputPin {
	constructor (pin_number) {

		// console.log('Creating PIN: ', pin_number);

		if (! (typeof pin_number == "number")) {
			throw new Error('Cannot construct OutputPin: number is undefined');
		}

		this.io = new Gpio(pin_number, 'out');
		this.id = pin_number;
		this.is_active = this.io.readSync() === 0;
	}

	set (bool) {
		bool = !! bool;
		this.io.write(bool ? 0 : 1);
		this.is_active = bool;
	}

	get () {
		return this.is_active;
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
}
