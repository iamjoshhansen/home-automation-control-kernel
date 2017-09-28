'use strict';

var Emitter   = require('./emitter.js'),
	OutputPin = require('./pin-output.js'),
	_         = require('lodash');

module.exports = class Out extends Emitter {

	constructor (id, params) {

		super();

		this.id         = id;
		this.label      = params.label;
		this.pin        = new OutputPin(params.pin);
		this.reasons    = [];

		let manualOff = params.manual_off || false;
		Object.defineProperty(this, 'manual_off', {
			enumerable: true,
			get: () => {
				return manualOff;
			},
			set: (val) => {
				if (manualOff !== val) {
					manualOff = !! val;

					if (this.reasons.length > 0) {
						if (manualOff) {
							// time to shut it down!
							// console.log(`time to shut it down: ${this.label}`);
							this.deactivate();
						} else {
							// It's been dead long enough!
							// console.log(`time to bring it online: ${this.label}`);
							this.activate();
						}
					}
				}
			}
		});
	}

	set (bool) {
		if (this.manual_off) {
			bool = false;
		}

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

	addReason (val) {
		const index = this.reasons.findIndex((v) => {
			return v === val;
		});

		if (index === -1) {
			this.reasons.push(val);
			this.trigger('change-reasons', [this.reasons]);
			this.trigger('add-reason', val);
			this.trigger(`add-reason:${val}`);
			this.activate();
		}

		return this;
	}

	removeReason (val) {
		const index = this.reasons.findIndex((v) => {
			return v === val;
		});

		if (index > -1) {
			this.reasons.splice(index, 1);
			this.trigger('change-reasons', [this.reasons]);
			this.trigger('remove-reason', val);
			this.trigger(`remove-reason:${val}`);
		}

		if (this.reasons.length === 0) {
			this.deactivate();
		}

		return this;
	}


	toJSON () {
		return {
			id        : this.id,
			label     : this.label,
			pin       : this.pin.id,
			is_active : this.pin.is_active
		};
	}
}
