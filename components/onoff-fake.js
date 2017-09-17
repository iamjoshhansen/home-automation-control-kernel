'use strict';

class Gpio {

	constructor (pin, type) {
		this.pin = pin;
		this.type = type;

		this.val = 0;
	}

	writeSync (val) {
		this.val = val;
		console.log('fake gpio -- setting `' + this.pin + '` to ' + (val ? 'off' : 'on'));
	}

	write (val) {
		this.val = val;
		console.log('fake gpio -- setting `' + this.pin + '` to ' + (val ? 'off' : 'on'));
	}

	readSync () {
		return this.val === 0;
	}

}

module.exports = {
	Gpio: Gpio
};
