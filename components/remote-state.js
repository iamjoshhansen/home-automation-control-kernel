'use strict';

var Emitter = require('./emitter'),
	_ = require('lodash'),
	axios = require('axios'),
	dateString = require('./date-string');


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

		const self = this;
		const start_time = new Date().getTime();

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

				const delta = new Date().getTime() - start_time;
				self.trigger('fetch-duration', delta);

			})
			.catch((er) => {
				console.log('RemoteState fetch failed. ', dateString('Y-m-d H:i:s'));
				//console.log(er);
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
