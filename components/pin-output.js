'use strict';

var Emitter = require('./emitter.js'),
	Gpio    = require( (process.platform == 'darwin') ? './onoff-fake.js' : 'onoff').Gpio;

module.exports = class OutputPin {
	constructor (number) {

		//console.log('Creating PIN: ', number);

		this.io = new Gpio(number, 'out');
		this.id = number;
		this.is_active = this.io.readSync() === 0;
	}

	set (bool) {
		bool = !! bool;
		this.io.writeSync(bool ? 0 : 1);
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
