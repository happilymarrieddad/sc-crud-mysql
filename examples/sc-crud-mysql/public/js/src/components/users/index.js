var usersComponent = Vue.extend({
	template: templatizer.users.index({}),
	data() {
		return {
			users:[],

			page:1,
			limit:25,
			num_users:0,
			total_users:0,
			pagination:false,

			first:'',
			last:'',
			email:'',
			password:'',
			confirm_password:'',

			ready:false
		}
	},
	watch:{
		search:function(val,oldVal) {
			this.fetchData(null)
		}
	},
	computed:{
		num_users:function() {
			return this.users.length
		},
		pagination:function() {
			return ( ( this.total_users >= this.limit ) ? true : false )
		}
	},
	methods:{
		delete() {
			
		},
		create() {

		},
		fetchData(data,respond) {
			var vm = this
			vm.$dispatch('read',{
				table:'users',
				limit:vm.limit,
				offset:(vm.page - 1) * vm.limit,
				search:vm.search
			},function(err,users) {
				if (err) { return vm.$root.transitionError(err) }
				if (respond && typeof respond == 'function') { return respond(users) }
				else { vm.users = users }
			})

		},
		updateData(users) {
			this.users = users
		}
	},
	events:{
		'users-update':function(response) {
			console.log(response)
		},
		'users-destroy':function(response) {
			console.log(response)
		},
		'users-store':function(response) {
			console.log(response)
		}
	},
    ready() {},
	route: {
		data(transition) {
			var vm = this
			vm.fetchData({},function(users) {
				transition.next({ ready:true,users:users })
			})
		},
		waitForData:true
	}
})