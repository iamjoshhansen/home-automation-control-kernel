'use strict';

let _ = require('lodash');

module.exports = function dateString (date) {
	return date.getFullYear() +
		'-' +
		_.padStart(date.getMonth().toString(), 2, '0') +
		'-' +
		_.padStart(date.getDate().toString(), 2, '0') +
		' ' +
		_.padStart(date.getHours().toString(), 2, '0') +
		':' +
		_.padStart(date.getMinutes().toString(), 2, '0') +
		':' +
		_.padStart(date.getSeconds().toString(), 2, '0') +
		' : ' +
		_.padStart(date.getMilliseconds().toString(), 4, '0')
};
