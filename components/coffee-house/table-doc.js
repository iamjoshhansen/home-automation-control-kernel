'use strict';

let Deferred = require('../deferred.js'),
	_        = require('lodash'),
	axios    = require('axios');

module.exports = class TableDoc {

	constructor (owner, properties, id , meta) {

		this.owner = owner;

		/*	ID
		------------------------------------------*/
			this.id = id || null;

		/*	properties
		------------------------------------------*/
			this.properties = _.cloneDeep(properties || {});
			this._server_properties = {};
			this._changes = {};

			// If we have an ID, store starting values as the server's copy. Else, these are "changes" to be applied on save
			if (this.id) {
				this._server_properties = _.cloneDeep(this.properties);
			} else {
				this._changes = _.cloneDeep(this.properties);
			}

		/*	meta
		------------------------------------------*/
			if (meta == undefined) {
				meta = {
					created  : null,
					modified : null
				};
			} else {
				if (meta.created == undefined) {
					meta.created = null;
				} else if (typeof(meta.created) == 'string') {
					meta.created = new Date(meta.created);
				}
				if (meta.modified == undefined) {
					meta.modified = null;
				} else if (typeof(meta.modified) == 'string') {
					meta.modified = new Date(meta.modified);
				}
			}

			this.meta = meta;

	}

	isNew () {
		return ! this.id;
	}

	set (data) {

		/*	Setting Changes
		------------------------------------------*/
			_.each(data, (val, key) => {
				if (val === null) {
					if (key in this._server_properties) {
						this._changes[key] = null;
					} else {
						delete this._changes[key];
					}
				} else {
					if (this._server_properties[key] == val) {
						delete this._changes[key];
					} else {
						this._changes[key] = val;
					}
				}
			});


		/*	Setting Properties
		------------------------------------------*/
			var props = _.cloneDeep(this._server_properties);

			_.each(this._changes, (val, key) => {
				if (val === null) {
					delete props[key];
				} else {
					props[key] = val;
				}
			});

			this.properties = props;

		return this;
	}

	fetch () {
		let self = this,
			dfr = new Deferred();

		if ( ! self.id) {
			dfr.reject('Cannot fetch. `id` is null');
		}

		axios.get(self.owner.owner.endpoint + 'index.php', {
			params: {
				table: self.owner.name,
				id: self.id
			}
		})
			.then((response) => {

				self.meta.created = new Date(response.data.meta.created);
				self.meta.modified = new Date(response.data.meta.modified);

				self.set(response.data.props);
				self._server_properties = _.cloneDeep(self.properties);
				self._changes = {};

			})
			.catch((er) => {
				dfr.reject(er);
			});

		return dfr.promise();
	}

	save () {
		let self = this,
			dfr = new Deferred();

		if ( self.isNew() ) {
			axios.post(self.owner.owner.endpoint, {
				table : self.owner.name,
				data  : self.properties
			})
				.then((response) => {

					// console.log('save success');
					// console.log(response);

					self.id = response.data.id;
					self.meta.created = new Date(response.data.meta.created);
					self.meta.modified = new Date(response.data.meta.modified);

					self._server_properties = _.cloneDeep(self.properties);
					self._changes = {};

					dfr.resolve();
				})
				.catch((er) => {
					// console.warn('save failed');
					// console.warn(er.response.data);
					// console.error(er);
					dfr.reject(er);
				});
		} else {

			if (_.keys(self._changes).length === 0) {

				dfr.resolve('no changes');

			} else {

				axios.patch(self.owner.owner.endpoint, {
					table : self.owner.name,
					id    : self.id,
					delta : self._changes
				})
					.then((response) => {

						//console.log('save success');
						//console.log(response);

						self.meta.modified = new Date(response.data.meta.modified);

						self._server_properties = _.cloneDeep(self.properties);
						self._changes = {};

						dfr.resolve('changes saved');
					})
					.catch((er) => {
						//console.warn('save failed');
						//console.warn(er.response.data);
						//console.error(er);
						dfr.reject(er);
					});
			}
		}

		return dfr.promise();
	}

	summary () {
		console.group(this.id);

		console.group('Server Properties');
		console.log(JSON.stringify(this._server_properties, null, 4));
		console.groupEnd();

		console.group('Changes');
		console.log(JSON.stringify(this._changes, null, 4));
		console.groupEnd();

		console.group('Properties');
		console.log(JSON.stringify(this.properties, null, 4));
		console.groupEnd();

		console.groupEnd();
	}

}
