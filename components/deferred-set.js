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
			let resolve_count = 0;

			_.each(dfrs, (dfr) => {
				if (dfr.state() == 'resolved') {
					resolve_count++;
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
				self.resolve(responses);
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
					self.reject(er);
				});
		});
	}

	get (key) {
		return this._dfrs[key];
	}

}
