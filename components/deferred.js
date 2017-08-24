'use strict';

module.exports = class Deferred {

	constructor () {

		let self = this;

		this.reject  = (arg) => {};
		this.resolve = (arg) => {};

		let state = 'pending',
			promise = new Promise(function (resolve, reject) {
				self.resolve = function () {
					if (state == 'pending') {
						state = 'resolved';
					}
					resolve.apply(self, arguments);
				};

				self.reject = function () {
					if (state == 'pending') {
						state = 'rejected';
					}
					reject.apply(self, arguments);
				};
			});

		this.state = function () {
			return state;
		};

		this.done = function (args) {
			promise.then(args, null);
			return self;
		};

		this.then = promise.then;

		this.fail = function (args) {
			promise.then(null, args);
			return self;
		};

		this.always = function (args) {
			promise.then(args, args);
			return self;
		}

		this.promise = function () {
			return this;
		};
	}
}
