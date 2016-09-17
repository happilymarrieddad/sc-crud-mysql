
var controllers = {
	SessionController:require('../controllers/SessionController.js'),
	UsersController:require('../controllers/UsersController.js')
}

module.exports = {
	controllers:controllers,
	register(socket) {

		function buildRoute(key) {
			socket.on(controllers[key].route,function(data,respond) {
				if (typeof data != 'object' || !data.method) return respond('Request must be an object and include a method.')
				var method = data.method
				if (controllers[key].hasOwnProperty(method)) {
					delete data.method
					controllers[key][method](data,respond,socket)
				} else {
					return respond('Method ' + method + ' is not registered')
				}
			})
		}

		for (key in controllers) {
			if (controllers.hasOwnProperty(key) && controllers[key].route) {
				buildRoute(key)
			}
		}

	}
}