'use strict';

var Emitter = require('./emitter.js'),
	Channel = require('./channel.js'),
	_       = require('lodash');

module.exports = class Relay extends Emitter {

	constructor (channels) {

		super();

		this.channels = {};

		var self = this;

		_.each(channels, (channel, id) => {
			var new_channel = new Channel(id, channel);
			new_channel.on('change:is_active', () => {
				self.trigger('change:is_active', [id,new_channel.is_active]);

				self.trigger(new_channel.is_active ? 'activate' : 'deactivate', id);
				self.trigger(new_channel.is_active ? 'activate' : 'deactivate' + ':' + id);
			});
			self.channels[id] = new_channel;
		});

	}

	setActiveState (id, val) {
		this.channels[id].setActiveState(val);
		return this;
	}

	toggleState (id) {
		this.channels[id].toggle();
		return this;
	}

	toJSON () {
		return _.mapValues(this.channels, (channel) => {
			return channel.toJSON();
		});
	}
}
