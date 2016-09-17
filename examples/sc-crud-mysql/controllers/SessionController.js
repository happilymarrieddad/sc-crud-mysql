var SessionController = {}
	async = require('async'),
	Users = require('../models/Users'),
	Password = require('../models/Password')

SessionController.route = 'session'

SessionController.store = function(data,respond,socket) {
	if (!data.email || !data.password) { return respond('You must enter an email and a password.') }
	var results = {}

	async.series([
		function(cb) {
			Users.findBy({ email:data.email },function(err,users) {
				if (err) { return respond(err) }
				else if (!users.length) { return respond('There is no account with that email.') }
				else {
					results.user = users[0]
					return cb()
				}
			})
		},
		function(cb) {
			if ( Password.verify(data.password,results.user.password) ) return cb()
			else return respond('Invalid password.')
		}
	],function() {
		delete results.user.password
		socket.setAuthToken(results.user)
		respond(null,results.user)
	})
}

SessionController.destroy = function(data,respond,socket) {
	socket.deauthenticate()
	return respond(null)
}

module.exports = SessionController