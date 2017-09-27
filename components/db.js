'use strict';

var Emitter = require('./emitter'),
	axios = require('axios');

module.exports = class DB extends Emitter {

	constructor (endpoint, table) {
		super();
		this.endpoint = endpoint;
		this.table = table;
	}

	fetch () {
		return axios.get(`${this.endpoint}/?table=${this.table}`);
	}

	get (id) {
		return axios.get(this.endpoint, {
			id: id,
			table: this.table,
		});
	}

	set (id, params) {
		params.id = id;
		return axios.post(`${this.endpoint}/?table=${this.table}`, params);
	}

	addToGroup (id, group, value) {
		return axios.post(`${this.endpoint}/group.php/?table=${this.table}`, {
			id,
			group,
			value,
			action: 'add',
		});
	}

	removeFromGroup (id, group, value) {
		return axios.post(`${this.endpoint}/group.php/?table=${this.table}`, {
			id,
			group,
			value,
			action: 'remove',
		});
	}
}
