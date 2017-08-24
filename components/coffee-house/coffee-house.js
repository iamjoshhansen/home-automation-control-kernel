'use strict';

let CoffeeTable = require('./coffee-table.js');

class CoffeeHouse {

	constructor (endpoint) {

		this.endpoint = endpoint;
		this.tables = {};

	}

	table (name) {

		if ( ! (name in this.tables)) {
			this.tables[name] = new CoffeeHouse.Table(this, name);
		}

		return this.tables[name];
	}

};

CoffeeHouse.Table = CoffeeTable;

module.exports = CoffeeHouse;
