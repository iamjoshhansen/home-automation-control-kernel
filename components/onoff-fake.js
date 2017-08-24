'use strict';

class Gpio {

	constructor (pin, type) {
		this.pin = pin;
		this.type = type;

		this.val = 0;
	}

	writeSync (val) {
		this.val = val;
	}

	readSync () {
		return this.val === 0;
	}

}

module.exports = {
	Gpio: Gpio
};
