Vue.use(VueRouter)
Vue.use(VueSocketcluster,{
	hostname:'localhost',
	port:'3000'
})

router.map({
	'/dashboard' : { component:dashboardComponent, auth:true },
	'/about' : { component:aboutComponent, auth:true },
	'/users' : { component:usersComponent, auth:true },
    '/session/create': { component : sessionCreateComponent, auth:false },
    '/users/create': { component : usersCreateComponent, auth:false }
})

router.redirect({
	'*':'/dashboard'
})

router.beforeEach(function(transition) {
	router.app.loading = true
	if (transition.to.auth && router.app.$sc.authState != 'authenticated') {
		router.app.loading = false
		transition.redirect('/session/create')
	} else if (router.app.$sc.authState == 'authenticated' && !transition.to.auth) {
		router.app.loading = false
		transition.redirect('/dashboard')
	} else {
		transition.next()
	}
})

router.afterEach(function(transition) {
	setTimeout(function() {
		router.app.loading = false
	},router.app.loading_delay)
})

router.start(Vue.extend({
	data() {
		return {
			loading_delay:20,
			show_success:false,
			success_msg:'',
			show_error:false,
			error_msg:'',

			started:false,
			loading:true,
			authenticated:false,

			first:'',
			last:'',
			email:''
		}
	},
	watch:{
		authenticated:function(val,oldVal) {
			if (val) { router.go({ path:'/dashboard' }) }
			else { router.go({ path:'/session/create' }) }
		}
	},
	methods:{
		transitionError(err) {
			this.alert(err,'error')
			router.go({ path:'/dashboard' })
		},
		setUserData() {
			var vm = this
			var authToken = vm.$sc.getAuthToken() || {}
			vm.first = authToken.first
			vm.last = authToken.last
			vm.email = authToken.email
		},
		alert(msg,type) {
			var vm = this
			try {
				vm[type+'_msg'] = msg
				vm['show_'+type] = true
				setTimeout(function() {
					vm[type+'_msg'] = null
				},3000)
			}catch(err) {}
		},
		logout() {
			var vm = this
			vm.$root.$sc.emit('session',{
				method:'destroy'
			},function(err) {
				if (err) { console.log(err);return vm.$root.alert(err,'error') }
			})
		}
	},
	events:{
		// update(data) {

		// },
		// destroy(data) {

		// },
		// store(data) {
		// 	// Do the publish here
		// },
		// read(data,respond) {
		// 	var vm = this

		// 	if (data && data.table && typeof data.table == 'string') {
		// 		var table = data.table
		// 		delete data.table
		// 		data.method = 'read'
		// 		vm.$root.$sc.emit(table,data,( respond && typeof respond == 'function' ? respond : function(){} ))
		// 		return false
		// 	}
		// 	return true
		// }
	},
	sockets:{
		connect(status) {
			var vm = this

			vm.authenticated = status.isAuthenticated
		},
		authenticate() {
			this.authenticated = true
			this.setUserData()
		},
		deauthenticate() {
			this.authenticated = false
		},
		update(data,respond) {
			var vm = this

			if (typeof data == 'object' && data.table) {
				vm.$broadcast(
					data.table+'-update',data,
					(respond && typeof respond == 'function' ? respond : function(){})
				)
			}
		},
		destroy(data) {
			var vm = this

			if (typeof data == 'object' && data.table) {
				vm.$broadcast(
					data.table+'-destroy',data,
					(respond && typeof respond == 'function' ? respond : function(){})
				)
			}
		},
		store(data) {
			var vm = this

			if (typeof data == 'object' && data.table) {
				vm.$broadcast(
					data.table+'-store',data,
					(respond && typeof respond == 'function' ? respond : function(){})
				)
			}
		}
	},
	components:{
		alert:VueStrap.alert,
		navbar:VueStrap.navbar
	},
	ready() {
		var vm = this
		vm.started = true
	}
}), '#app')