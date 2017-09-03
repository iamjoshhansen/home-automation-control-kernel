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
			new_channel.on('change', () => {
				self.trigger('change', [id, new_channel.is_active]);
				self.trigger(new_channel.is_active ? 'activate' : 'deactivate', [id, new_channel.is_active]);
				self.trigger((new_channel.is_active ? 'activate' : 'deactivate') + ':' + id, new_channel.is_active);
			});
			self.channels[id] = new_channel;
		});

	}

	get (id) {
		if (id in this.channels) {
			return this.channels[id];
		} else {
			return null;
		}
	}

	setActiveState (id, val) {
		this.channels[id].setActiveState(val);
		return this;
	}

	activate (id) {
		this.channels[id].setActiveState(true);
		return this;
	}

	deactivate (id) {
		this.channels[id].setActiveState(false);
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
