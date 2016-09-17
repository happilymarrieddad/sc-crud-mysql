var aboutComponent = Vue.extend({
	template: templatizer.about.index({}),
	data() {
		return {
			ready:false
		}
	},
	methods:{
		fetchData(respond) {
			if (respond && typeof respond == 'function') respond(null)
		}
	},
    ready() {
    	var vm = this
    },
	route: {
		data(transition) {
			var vm = this
			vm.fetchData(function(err) {
				if (err) {
					vm.$root.alert(err,'error')
					router.go('/')
				} else {
					vm.ready = true
					transition.next()
				}
			})
		},
		waitForData:true
	}
})