var usersCreateComponent = Vue.extend({
	template: templatizer.users.create({}),
	data() {
		return {
			first:'',
			last:'',
			email:'',
			password:'',

			ready:false
		}
	},
	methods:{
		fetchData(respond) {
			if (respond && typeof respond == 'function') respond(null)
		},
		clearFields() {
			this.first = ''
			this.last = ''
			this.email = ''
			this.password = ''
		},
		create() {
			var vm = this

			validate.async({
				first:vm.first,
				last:vm.last,
				email:vm.email,
				password:vm.password,
				visible:1
			},{
				first:{presence:true},
				last:{presence:true},
				email:{presence:true},
				password:{presence:true}
			}).then(function(attributes){
				vm.$root.$sc.emit('create',{
					table:'users',
					post:attributes
				},function(err,new_user) {
					if (err) { return vm.$root.alert(err,'error') }
					vm.$root.alert('Successfully created account ' + new_user.email + '! Please log in.','success')
					router.go({ path:'/session/create' })
					console.log(new_user)
				})
				// vm.$root.$sc.emit('users',{
				// 	method:'store',
				// 	user:attributes
				// },function(err,new_user) {
				// 	if (err) { return vm.$root.alert(err,'error') }
				// 	vm.$root.alert('Successfully created account ' + new_user.email + '! Please log in.','success')
				// 	router.go({ path:'/session/create' })
				// })
			},function(errors) {
				var error = null
				for (var key in errors) {
					error = errors[key][0]
					break;
				}
				vm.$root.alert(error,'error')
			})
		}
	},
    ready() {
    	var vm = this
    },
	route: {
		data(transition) {
			var vm = this
			vm.fetchData(function(err) {
				if (err) { transition.abort() }
				else {
					vm.ready = true
					vm.clearFields()
					transition.next()
				}
			})
		},
		waitForData:true
	}
})