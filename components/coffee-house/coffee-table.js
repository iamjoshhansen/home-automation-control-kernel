'use strict';

let CoffeeHouse = require('./coffee-house.js'),
	TableDoc    = require('./table-doc.js'),
	_           = require('lodash'),
	axios       = require('axios'),
	Deferred    = require('../deferred.js');

module.exports = class CoffeeTable {

	constructor (owner, table_name) {

		this.owner  = owner;
		this.name   = table_name;
		this.docs   = [];

	}

	fetch (_id) {
		let self = this,
			dfr = new Deferred(),
			params = {
				table: this.name
			};

		if (_id) {
			params.id = _id;
		}

		// console.log('CoffeeTable fetching: ' + this.name);

		axios.get(this.owner.endpoint + 'index.php', {
			params: params
		})
			.then(function (response) {
				//console.log('response: ', response);

				if (_id) {
					let doc = self.create(response.data.props, _id, response.data.meta);
					dfr.resolve(doc);
				} else {
					_.each(response.data, (data, id) => {
						self.create(data.props, id, data.meta);
					});

					dfr.resolve(self.docs);
				}
			})
			.catch(function (err) {
				//console.log('err: ', err);
				dfr.reject(err);
			});

		return dfr;
	}

	create (properties, id , meta) {
		let doc = new TableDoc(this, properties, id , meta);
		this.docs.push(doc);
		return doc;
	}

	post (properties, _id) {
		let self = this,
			dfr = new Deferred(),
			doc = new TableDoc(self, properties);

		doc.save()
			.done(function () {
				self.docs.push(doc);
				dfr.resolve(doc);
			})
			.fail(function () {
				dfr.reject();
			});

		return dfr;
	}

	delete (id) {
		let self = this,
			dfr  = new Deferred(),
			doc  = _.find(self.docs, (doc) => {
				return doc.id == id;
			});

		if (doc) {
			axios.delete(self.owner.endpoint, {
				data: {
					id: id,
					table: self.name
				}
			})
				.then((response) => {
					let doc_index = _.findIndex(self.docs, (doc) => {
						return doc.id == id;
					});
					self.docs.splice(doc_index, 1);
					dfr.resolve(doc);
				})
				.catch((er) => {
					// console.warn('delete failed');
					// console.error(er);
					dfr.reject(er);
				});

		} else {
			dfr.reject('Document `' + id + '` does not exist');
		}
		return dfr;
	}

}
