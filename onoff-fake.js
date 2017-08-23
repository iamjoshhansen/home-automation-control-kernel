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

}

module.exports = {
	Gpio: Gpio
};
