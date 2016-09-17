var Lynchpin = require('./Lynchpin')

var Users = function() {
	var self = this

	self._init()
}

Users.prototype = Object.create(Lynchpin.prototype)

Users.prototype._init = function() {
	var self = this

	self._table = 'users'
	Lynchpin.call(self,require('../config.json').db)
}

module.exports = new Users()