var _ = require('lodash')

var Filter = function(scServer,options) {
	var self = this

	this.options = options || {}
	this.cache = this.options.cache

	scServer.addMiddleware(scServer.MIDDLEWARE_EMIT,function(req,next) {
		if (req.event == 'create' || req.event == 'read' || req.event == 'update' || req.event == 'delete') {

		}
		next()
	})

	scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN,function(req,next) {
		next()
	})

	scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE,function(req,next) {
		next()
	})
}

module.exports = Filter