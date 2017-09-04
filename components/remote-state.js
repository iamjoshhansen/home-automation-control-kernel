'use strict';

var Emitter = require('./emitter.js'),
	_       = require('lodash'),
	axios   = require('axios');


module.exports = class RemoteState extends Emitter {

	constructor (endpoint, interval) {

		super();

		this.endpoint = endpoint;
		this.items = {};

		let self = this;

		self.fetch();

		setInterval(() => {
			self.fetch();
		}, interval);

	}

	fetch () {

		let self = this;

		return axios.get(this.endpoint)
			.then((response) => {

				_.each(response.data, (remote_item, id) => {
					if (id in self.items) {
						var local_item = self.items[id];
						if (remote_item.is_active != local_item.is_active) {
							local_item.is_active = remote_item.is_active;
							self.trigger('change', [id, local_item.is_active]);
							self.trigger('change:' + id, local_item.is_active);
						}
					} else {
						self.items[id] = remote_item;
					}
				});

				// console.log(_.map(response.data, (item) => {
				// 	return item.is_active ? 'Y' : '-';
				// }).join(' '));

			})
			.catch((er) => {
				console.log('RemoteState fetch failed');
				console.log(er);
			});
	}

	set (id, bool) {
		var self = this;

		return axios.patch(this.endpoint, {
			id: id,
			is_active: bool
		})
			.then(() => {
				self.items[id].is_active = bool;
			});
	}

	get (id) {
		return axios.get(this.endpoint, {
			id: id
		});
	}

	toJSON () {
		return this.items;
	}
}
