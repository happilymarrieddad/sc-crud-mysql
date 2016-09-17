var UsersController = {}
	async = require('async'),
	Users = require('../models/Users'),
	Password = require('../models/Password')

UsersController.route = 'users'

UsersController.store = function(data,respond) {
	if (!data.user) { return respond('You must pass in a user object.') }

	Password.hash(data.user.password,function(err,hash) {
		if (err) { return respond(err) }
		data.user.password = hash

		Users.store(data.user,function(err,new_user) {
			if (err) { return respond(err) }
			delete new_user.password
			return respond(null,new_user)
		})

	})
}

UsersController.read = function(data,respond) {
	Users.index(data,function(err,users) {
		if (err) { console.log(err);return respond('Failed to get user data.') }
		return respond(err,users)
	})
}

module.exports = UsersController