var sessionCreateComponent = Vue.extend({
	template: templatizer.session.create({}),
	data() {
		return {
			email:'',
			password:'',

			ready:false
		}
	},
	methods:{
		login() {
			var vm = this

			validate.async({
				email:vm.email,
				password:vm.password
			},{
				email:{presence:true},
				password:{presence:true}
			}).then(function(attributes) {
				vm.$root.$sc.emit('session',{
					method:'store',
					email:attributes.email,
					password:attributes.password
				},function(err) {
					if (err) { console.log(err);return vm.$root.alert(err,'error') }
					// vm.$root.authenticated = true
					// router.go({ path:'/dashboard' })
				})
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
			vm.ready = true
			transition.next()
		}
	}
})