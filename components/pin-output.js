'use strict';

var Emitter = require('./emitter.js'),
	Gpio    = require( (process.platform == 'darwin') ? './onoff-fake.js' : 'onoff').Gpio;

module.exports = class OutputPin {
	constructor (number) {

		//console.log('Creating PIN: ', number);

		var io = new Gpio(number, 'out');

		Object.defineProperty(this, 'io', {
			value: io
		});

		Object.defineProperty(this, 'id', {
			value: number
		});

		Object.defineProperty(this, 'state', {
			get: () => {
				return io.readSync() === 0;
			}
		});

	}

	set (bool) {
		this.io.writeSync(bool ? 0 : 1);
	}

	activate () {
		return this.set(true);
	}

	deactivate () {
		return this.set(false);
	}
}
