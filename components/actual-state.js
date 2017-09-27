'use strict';

var Emitter = require('./emitter'),
	axios = require('axios');

module.exports = class ActualState extends Emitter {

	constructor (endpoint) {
		super();
		this.endpoint = endpoint;
	}

	set (id, bool) {
		return axios.patch(this.endpoint, {
			id: id,
			is_active: bool
		});
	}

	get (id) {
		return axios.get(this.endpoint, {
			id: id
		});
	}
}
