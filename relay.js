'use strict';

var Emitter = require('./emitter.js'),
	Channel = require('./channel.js'),
	_       = require('lodash');

module.exports = class Relay extends Emitter {

	constructor (channels) {

		super();

		this.channels = [];

		var self = this;

		_.each(channels, (channel, i) => {
			var new_channel = new Channel(channel);
			new_channel.on('change:state', () => {
				self.trigger('change:state', [i,new_channel.state]);
			});
			self.channels.push(new_channel);
		})

	}

	setState (index, val) {
		this.channels[index].setState(val);
		return this;
	}

	toggleState (index) {
		this.channels[index].toggle();
		return this;
	}

	toJSON () {
		return _.map(this.channels, (channel) => {
			return channel.toJSON();
		});
	}
}
