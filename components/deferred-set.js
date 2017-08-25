'use strict';

let Deferred = require('./deferred.js'),
	_        = require('lodash');

module.exports = class DeferredSet extends Deferred {

	constructor (dfrs) {

		super();

		this._dfrs = dfrs;

		let self = this,
			is_obj = ! _.isArray(dfrs);

		function maybeResolve () {
			console.log('maybe resolve...');

			let resolve_count = 0;

			_.each(dfrs, (dfr, key) => {
				if (dfr.state() == 'resolved') {
					resolve_count++;
					console.log('  x ' + key);
				} else {
					console.log('  - ' + key);
				}
			});

			if (resolve_count == _.keys(dfrs).length) {
				let responses = is_obj ? {} : [];
				_.each(dfrs, (dfr, key) => {
					dfr.done((response) => {
						if (is_obj) {
							responses[key] = response;
						} else {
							responses.push(response);
						}
					});
				});
				console.log('  resolving!');
				self.resolve(responses);
			} else {
				console.log('  not resolving');
			}
		}

		_.each(dfrs, (dfr, key) => {
			if (_.isString(dfr)) {
				dfrs[key] = new Deferred();
			}

			dfr
				.done(() => {
					maybeResolve();
				})
				.fail((er) => {
					console.log('rejecting');
					self.reject(er);
				});
		});
	}

	get (key) {
		return this._dfrs[key];
	}

}
