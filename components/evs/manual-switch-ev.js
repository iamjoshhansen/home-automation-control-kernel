'use strict';

let Ev          = require('./ev'),
	Deferred    = require('../deferred'),
	CoffeeHouse = require('../../components/coffee-house/coffee-house'),
	_           = require('lodash');

module.exports = class ManualSwitchEv extends Ev {

	constructor (params) {

		super(params);

		let self = this;

		this.interval = null;

		let db = new CoffeeHouse(params.endpoint);
		this.table = db.table(params.table);
		this.doc = params.doc;

		this.switches = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];

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
