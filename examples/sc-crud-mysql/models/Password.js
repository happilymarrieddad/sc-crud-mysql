var bcrypt = require('bcrypt')
var Password = function() {
	var self = this
}

Password.prototype.hash = function(pwd,respond) {
	if (!pwd || typeof pwd != 'string') { return respond('Password must be a valid string.') }
	return respond(null,bcrypt.hashSync(pwd,bcrypt.genSaltSync(10)))
}

Password.prototype.verify = function(pwd,hash) {
	return bcrypt.compareSync(pwd,hash)
}

module.exports = new Password()