'use strict';

let axios      = require('axios'),
	_          = require('lodash'),
	dateString = require('./date-string.js');

module.exports = class Metrics {

	constructor (endpoint) {
		this.endpoint = endpoint;
	}

	post (event_id, data) {

		if (_.isUndefined(data)) {
			data = {
				count: 1
			};
		} else if (_.isNumber(data)) {
			data = {
				count: data
			};
		} else if (_.isString(data)) {
			data = {
				value: data
			};
		} else if (_.isDate(data)) {
			data = {
				date: dateString(data)
			};
		}

		return axios.post(this.endpoint, {
			table: event_id,
			data: _.defaults(data, {
				_date: dateString(new Date())
			})
		});
	}

}
