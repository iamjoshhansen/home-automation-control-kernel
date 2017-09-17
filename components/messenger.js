'use strict';

const axios = require('axios');

module.exports = (msg) => {

	console.log('PING: ', msg);
	return axios.post('https://maker.ifttt.com/trigger/reminder/with/key/f3HqyRey51BeJWWjrq4I-AP9hy_IosZZ3IZfDR5lGya', {
			value1: msg
		});

}
