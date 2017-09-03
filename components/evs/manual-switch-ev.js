'use strict';

let Ev          = require('./ev.js'),
	Deferred    = require('../deferred.js'),
	CoffeeHouse = require('../../components/coffee-house/coffee-house.js'),
	_           = require('lodash');

module.exports = class ManualSwitchEv extends Ev {

	constructor (params) {

		super(params);

		let self = this;

		self.interval = null;

		let db = new CoffeeHouse(params.endpoint);
		self.table = db.table(params.table);
		self.doc = params.doc;

		self.switches = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
		_.each(self.switches, (sw, i) => {
			var ev = new Ev({
				title: i+'',
				state: false
			});

			self.switches[i] = ev;

			ev.on('change', (state) => {
				self.trigger('change', [ev.title, ev.state]);
				self.trigger('change:' + ev.title, ev.state);
			});
		})

		this.activate();
	}

	ping () {
		let self = this,
			dfr = new Deferred();

		this.table.fetch(this.doc)
			.done((doc) => {
				//console.log('response: ', response);

				_.each(doc.properties, (val, key) => {
					self.switches[key].state = val;
				});

				var list = _.map(self.switches, (s) => {
					return s.state ? 'true' : 'false';
				}).join(', ');
				console.log('switches: ', list);

				dfr.resolve();
			})
			.fail((er) => {
				console.log('Cannot get document');
				console.log(er);
				dfr.reject(er);
			});

		return dfr.promise();
	}

	activate () {

		var self = this;

		this.ping()
			.done(() => {
				self.interval = setTimeout(() => {
					self.activate();
				}, 1000);
			});

		return self;
	}

	deactivate () {
		clearTimeout(this.interval);
	}

	toJSON () {
		return _.extend(super.toJSON(), {
			start     : this.start,
			every     : this.every,
			for       : this.for,
			not       : this.not
		});
	}
}


function duration (amount) {

	amount = amount.replace(/ /g,'');

	var segments = [],
		digit = '',
		value = '',
		mode = 'd';

		_.each(amount, (c) => {
		if (('0123456789.').indexOf(c) > -1) {
			if (mode == 'v') {
				segments.push(digit + value);
				digit = '';
				value = '';
				mode = 'd';
			}
			digit += c;
		} else {
			value += c;
			if (mode == 'd') {
				mode = 'v';
			}
		}
	});
	segments.push(digit + value);

	return _.sum(_.map(segments, simpleDuration));
}

function simpleDuration (amount) {
	var numbers = parseFloat(amount.match(/\d/g).join('')),
		letters = amount.match(/\D/g).join('');

	return numbers * duration.map[letters];
}

duration.map = {
	'w' : 1000 * 60 * 60 * 24 * 7,
	'd' : 1000 * 60 * 60 * 24,
	'h' : 1000 * 60 * 60,
	'm' : 1000 * 60,
	's' : 1000
};
